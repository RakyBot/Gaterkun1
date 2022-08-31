import RFCommand from "../commandClass";
import { Client, CommandInteraction, Message } from "discord.js";
import { config } from "../../modules/config";
import Queue, { queueMapType } from "../../musicHandler/queue";
import { basicEmbed, colorPalette } from "../../modules/responses";
import { AudioPlayerStatus } from "@discordjs/voice";

export default class QueueCommand extends RFCommand {
    constructor(client: Client) {
        super(client)
    }

    slashInfo = {
        name: 'queue',
        description: "See the current queue",
    }

    async callback(interaction: CommandInteraction, config: config, queueMap: queueMapType) {
        return new Promise(async (res, rej) => {

            const guild = interaction.guild
            const botMember = await guild.members.fetch(interaction.client.user.id).catch((err) => { throw err; })
            const queue = new Queue(interaction.client, queueMap)
            const guildQueue = queue.queueMap.get(guild.id)
            const result = queue.constructEmbed(guild.id)
                if (!result || !guildQueue) return await interaction.editReply({ embeds: [ basicEmbed( `🛑｜An error occurred getting the queue.`, colorPalette.error ) ] }).catch((err) => { throw err; });
            
            let queueStatus: string
            if (guildQueue.settings.trackLoop) {
                queueStatus = "🔂｜Looping the current track."
            } else if (guildQueue.settings.queueLoop) {
                queueStatus = "🔁｜Looping the queue."
            } else if (guildQueue.settings.shuffle) {
                queueStatus = "🔀｜Shuffling the queue."
            }else {
                queueStatus = "🟦｜Not looping."
            }

            if (guildQueue.player.state.status === AudioPlayerStatus.Paused) {
                queueStatus = queueStatus.concat(`\n⏸️｜The queue is currently paused.`)
            }

            let timeRemaining: string = "`No track is currently playing.`"
            if (guildQueue.player.state.status === AudioPlayerStatus.Playing) {
                function fmtMSS(s: number){return(s-(s%=60))/60+(9<s?':':':0')+s} // Seconds -> M:SS (Minutes: Seconds)
                const currentTrack = guildQueue.queue[guildQueue.currentTrack]
                timeRemaining = currentTrack ? `${"`"}${fmtMSS(Math.floor(guildQueue.currentResource.resource.playbackDuration / 1000) + guildQueue.currentResource.savedPassedTime)}${"`"}/${"`"}${fmtMSS(Number(currentTrack.duration))}${"`"}` : "`No track is currently playing.`"
            }

            const queueEmbed = {
                color: colorPalette.default,
                title: "Track Queue",
                description: `Channel: <#${botMember.voice.channelId}>\n${queueStatus}\n${timeRemaining}`,
                fields: result.trackArray[result.currentPage - 1],
                footer: {
                    text: `Page ${result.currentPage} of ${result.pageCount}.`
                }
            }

            const reply = await interaction.editReply({ embeds: [ queueEmbed ], components: [ result.messageActionRow ] }).catch(err => {}) as Message

            queue.registerEmbed(guild.id, reply.id, interaction.user.id, result.currentPage, result.pageCount, result.trackArray.length)

        })
    }
}
