import RFCommand from "../commandClass";
import { Client, CommandInteraction } from "discord.js";
import { config } from "../../modules/config";
import Queue, { queueMapType } from "../../musicHandler/queue";
import { basicEmbed, colorPalette } from "../../modules/responses";

export default class ClearCommand extends RFCommand {
    constructor(client: Client) {
        super(client)
    }

    slashInfo = {
        name: 'clear',
        description: "Clear the queue.",
    }

    async callback(interaction: CommandInteraction, config: config, queueMap: queueMapType) {
        return new Promise(async (res, rej) => {

            const guild = interaction.guild
            const result = new Queue(this.client, queueMap).clear(interaction.guildId)

            if (result) {
                return interaction.editReply({ embeds: [ basicEmbed( `🗑️｜Cleared the queue.`, colorPalette.trackOperation ) ] })
            } else {
                return interaction.editReply({ embeds: [ basicEmbed( `🛑｜Error clearing the queue.`, colorPalette.error ) ] })
            }

        })
    }
}
