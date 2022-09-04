import { ButtonInteraction, Message } from "discord.js";
import Queue, { queueMapType } from "../musicHandler/queue";

export default async function queuePageButtons(interaction: ButtonInteraction, queueMap: queueMapType) {

    const guild = interaction.guild
    const message = interaction.message as Message
    const queue = new Queue(interaction.client, queueMap)
    const guildQueue = queueMap.get(guild.id)
        if (!guildQueue) return await interaction.reply({ content: `An error occured moving the page.`, ephemeral: true });
    const botMember = await guild.members.fetch(interaction.client.user.id).catch((err) => { throw err; });
    
    const currentEmbedInfo = queue.getQueueEmbed(guild.id, message.id)
        if (!currentEmbedInfo) return await interaction.reply({ content: `This message is inactive! Run ${"`"}/queue${"`"} to get another one.`, ephemeral: true });
    const currentPage = currentEmbedInfo.currentPage
    
    // Global Cleanup for Inactive Embeds
    const timestamp = Math.floor(Date.now() / 1000)
    let currentInactive = false
    for (const [index, embedObj] of Array.from(guildQueue.activeEmbeds.entries())) {

        if (embedObj.lastUsed + 120 < timestamp) { // It's been more than 2 minutes since it was last used
            
            guildQueue.activeEmbeds.splice(index, 1) // Remove the embed
            if (embedObj.messageId == message.id) currentInactive = true
            
        }
        
    }
    if (currentInactive) return await interaction.reply({ content: `This message is inactive! Run ${"`"}/queue${"`"} to get another one.`, ephemeral: true });
    
    if (interaction.member.user.id != currentEmbedInfo.authorId) return await interaction.reply({ content: `This isn't your queue to use! Run ${"`"}/queue${"`"} to get your own.`, ephemeral: true });

    // Previous Page Button Pressed \\
    if (interaction.customId == "previousQueuePage") {
        const calculated = queue.constructEmbed(guild.id, currentPage - 1)
            if (!calculated) return await interaction.reply({ content: `An error occured moving the page.`, ephemeral: true }).catch((err) => { throw err; });

        const currentPageIndex = calculated.currentPage - 1
        
        if (!calculated.trackArray[(currentEmbedInfo.currentPage - 1) - 1]) return await interaction.reply({ content: `Can't go to the previous page.`, ephemeral: true }).catch((err) => { throw err; });

        const queueEmbed = {
            color: 0xdb4425,
            title: "Song Queue",
            description: `Channel: <#${botMember.voice.channelId}>`,
            fields: calculated.trackArray[currentPageIndex],
            footer: {
                text: `Page ${calculated.currentPage} of ${calculated.trackArray.length}`
            }
        }

        queue.renewQueueEmbed(guild.id, message.id)
        queue.updateEmbed(guild.id, interaction.message.id, calculated.currentPage, calculated.pageCount)

        await interaction.update({ embeds: [queueEmbed], components: [calculated.actionRow] }).catch((err) => { throw err; });
        await interaction.reply({ content: `Went to the previous page!`, ephemeral: true }).catch((err) => { throw err; });






    // Next Page Button Pressed \\
    } else if (interaction.customId == "nextQueuePage") {
        const calculated = queue.constructEmbed(guild.id, currentPage + 1)
            if (!calculated) return await interaction.reply({ content: `An error occured moving the page.`, ephemeral: true }).catch((err) => { throw err; });

        const currentPageIndex = calculated.currentPage - 1

        console.log(JSON.stringify(calculated.trackArray))
        if (!calculated.trackArray[(currentEmbedInfo.currentPage - 1) + 1]) return await interaction.reply({ content: `Can't go to the next page.`, ephemeral: true }).catch((err) => { throw err; });

        const queueEmbed = {
            color: 0xdb4425,
            title: "Song Queue",
            description: `Channel: <#${botMember.voice.channelId}>`,
            fields: calculated.trackArray[currentPageIndex],
            footer: {
                text: `Page ${calculated.currentPage} of ${calculated.trackArray.length}`
            }
        }

        queue.renewQueueEmbed(guild.id, message.id)
        queue.updateEmbed(guild.id, interaction.message.id, calculated.currentPage, calculated.pageCount)

        await interaction.update({ embeds: [queueEmbed], components: [calculated.actionRow] }).catch((err) => { throw err; });

    }

}
