import RFCommand from "../commandClass";
import { Client, ChatInputCommandInteraction } from "discord.js";
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

    async callback(interaction: ChatInputCommandInteraction, config: config, queueMap: queueMapType) {
        return new Promise(async (res, rej) => {

            const guild = interaction.guild
            const result = new Queue(this.client, queueMap).clear(interaction.guildId)

            if (result) {
                return interaction.editReply({ embeds: [ basicEmbed( `<:xdda:1013166313583161351> Borró la cola.`, colorPalette.trackOperation ) ] })
            } else {
                return interaction.editReply({ embeds: [ basicEmbed( `<:xdda:1013162318764449883> Error al borrar la cola.`, colorPalette.error ) ] })
            }

        })
    }
}
