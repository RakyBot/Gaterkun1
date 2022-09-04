import RFCommand from "../commandClass";
import { ApplicationCommandOptionType, Client, ChatInputCommandInteraction } from "discord.js";
import { config } from "../../modules/config";
import Queue, { queueMapType } from "../../musicHandler/queue";
import { basicEmbed, colorPalette } from "../../modules/responses";

export default class FFCommand extends RFCommand {
    constructor(client: Client) {
        super(client)
    }

    slashInfo = {
        name: 'fastforward',
        description: "Fast forward the track currently playing.",
        options: [
            {
                name: "time",
                description: "The amount of time (seconds) to fast forward the currently playing track.",
                type: ApplicationCommandOptionType.Integer,
                required: true
            },
        ]
    }

    async callback(interaction: ChatInputCommandInteraction, config: config, queueMap: queueMapType) {
        return new Promise(async (res, rej) => {

            const guild = interaction.guild
            const guildQueue = queueMap.get(guild.id)
                if (!guildQueue) return;
            const time = interaction.options.getInteger('time')
            
            const trackDuration = guildQueue.queue[guildQueue.currentTrack].duration
            const timePassed = Math.floor(guildQueue.currentResource.resource.playbackDuration / 1000) + guildQueue.currentResource.savedPassedTime
            const timeRemaining = Math.floor(trackDuration - timePassed)
            
            if (time < 1) return interaction.editReply({ embeds: [ basicEmbed( `🛑｜Please enter a time greater than 0 seconds.`, colorPalette.error ) ] })
            //if (time > timeRemaining) return interaction.editReply({ embeds: [ basicEmbed( `🛑｜Please enter a time less than ${timeRemaining} seconds.`, colorPalette.error ) ] })
            
            const result = await new Queue(interaction.client, queueMap).loadTrack(guild.id, guildQueue.currentTrack, timePassed + time)

            if (result) {
                return interaction.editReply({ embeds: [ basicEmbed( `⏩｜Fast Forwarded the track ${time} seconds.`, colorPalette.trackOperation ) ] })
            } else {
                return interaction.editReply({ embeds: [ basicEmbed( `🛑｜Could not fast forward to that time.`, colorPalette.error ) ] })
            }

        })
    }
}
