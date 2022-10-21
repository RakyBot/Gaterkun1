import RFCommand from "../commandClass";
import { Client, ChatInputCommandInteraction } from "discord.js";
import { config } from "../../modules/config";
import Queue, { queueMapType } from "../../musicHandler/queue";
import { basicEmbed, colorPalette } from "../../modules/responses";

export default class MoveCommand extends RFCommand {
    constructor(client: Client) {
        super(client)
    }

    slashInfo = {
        name: 'pause',
        description: "🔌 Pausa el bot de música.",
    }

    async callback(interaction: ChatInputCommandInteraction, config: config, queueMap: queueMapType) {
        return new Promise(async (res, rej) => {

            const guild = interaction.guild
            const result = await new Queue(interaction.client, queueMap).pause(guild.id)
            if (result) {
                return interaction.editReply({ embeds: [ basicEmbed( `<:xdda:1013162815109992448> Hizo una pausa en la pista.`, colorPalette.trackOperation ) ] })
            } else {
                return interaction.editReply({ embeds: [ basicEmbed( `<:xdda:1013162318764449883> No se pudo pausar la pista.`, colorPalette.error ) ] })
            }

        })
    }
}
