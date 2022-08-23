import RFCommand from "../commandClass";
import { Client, CommandInteraction } from "discord.js";
import { config } from "../../modules/config";
import Queue, { queueMapType } from "../../musicHandler/queue";
import { basicEmbed, colorPalette } from "../../modules/responses";

export default class SetTimeCommand extends RFCommand {
    constructor(client: Client) {
        super(client)
    }

    slashInfo = {
        name: 'settime',
        description: "Sets the track to a specific time.",
        options: [
            {
                name: "time",
                description: "The amount of time (seconds) to set the currently playing track to.",
                type: "INTEGER",
                required: true
            },
        ],
    }

    async callback(interaction: CommandInteraction, config: config, queueMap: queueMapType) {
        return new Promise(async (res, rej) => {

            const guild = interaction.guild
            const guildQueue = queueMap.get(guild.id)
                if (!guildQueue) return;
            const time = interaction.options.getInteger('time')


            const result = await new Queue(interaction.client, queueMap).loadTrack(guild.id, guildQueue.currentTrack, time)

            if (result) {
                return interaction.editReply({ embeds: [ basicEmbed( `🔄｜Set the time to ${time} seconds.`, colorPalette.trackOperation ) ] })
            } else {
                return interaction.editReply({ embeds: [ basicEmbed( `🛑｜ Could not go to that time.`, colorPalette.error ) ] })
            }

        })
    }
}
