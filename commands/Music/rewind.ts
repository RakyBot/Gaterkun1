import RFCommand from "../commandClass";
import { Client, CommandInteraction } from "discord.js";
import { config } from "../../modules/config";
import Queue, { queueMapType } from "../../musicHandler/queue";
import { basicEmbed, colorPalette } from "../../modules/responses";

export default class RewindCommand extends RFCommand {
    constructor(client: Client) {
        super(client)
    }

    slashInfo = {
        name: 'rewind',
        description: "Rewind the track currently playing.",
        options: [
            {
                name: "time",
                description: "The amount of time (seconds) to rewind the currently playing track.",
                type: "INTEGER",
                required: true
            },
        ]
    }

    async callback(interaction: CommandInteraction, config: config, queueMap: queueMapType) {
        return new Promise(async (res, rej) => {

            const guild = interaction.guild
            const guildQueue = queueMap.get(guild.id)
                if (!guildQueue) return;
            const time = interaction.options.getInteger('time')
            const timePassed = Math.floor(guildQueue.currentResource.resource.playbackDuration / 1000) + guildQueue.currentResource.savedPassedTime
            
            if (time < 1) return interaction.editReply({ embeds: [ basicEmbed( `🛑｜Please enter a time greater than 0 seconds.`, colorPalette.error ) ] })
            //if (time > timePassed) return interaction.editReply({ embeds: [ basicEmbed( `🛑｜Please enter a time less than ${timePassed} seconds.`, colorPalette.error ) ] }) // ERROR: A lot of seeking beyond limit errors. Maybe play-dl has an easier, internal way to handle this?
                                                                                                                                                                              // Also, wouldn't this solution of editing the resource affect the playback time reading? We might have to manually code this in to keep accuracy.
            
            const result = await new Queue(interaction.client, queueMap).loadTrack(guild.id, guildQueue.currentTrack, timePassed - time) // Negative time because we're rewinding
            if (result) {
                return interaction.editReply({ embeds: [ basicEmbed( `⏪｜Rewinded the track ${time} seconds.`, colorPalette.trackOperation ) ] })
            } else {
                return interaction.editReply({ embeds: [ basicEmbed( `🛑｜Could not rewind to that time.`, colorPalette.error ) ] })
            }

        })
    }
}
