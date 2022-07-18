import RFCommand from "../commandClass";
import { Client, CommandInteraction } from "discord.js";
import { config } from "../../modules/config";
import Queue, { queueMapType } from "../../musicHandler/queue";
import { basicEmbed, colorPalette } from "../../modules/responses";

export default class MoveCommand extends RFCommand {
    constructor(client: Client) {
        super(client)
    }

    slashInfo = {
        name: 'pause',
        description: "Pause the music bot.",
    }

    async callback(interaction: CommandInteraction, config: config, queueMap: queueMapType) {
        return new Promise(async (res, rej) => {

            const guild = interaction.guild
            const result = await new Queue(interaction.client, queueMap).pause(guild.id)
            if (result) {
                return interaction.editReply({ embeds: [ basicEmbed( `⏸️｜Paused the track.`, colorPalette.trackOperation ) ] })
            } else {
                return interaction.editReply({ embeds: [ basicEmbed( `🛑｜Could not pause the track.`, colorPalette.error ) ] })
            }

        })
    }
}
