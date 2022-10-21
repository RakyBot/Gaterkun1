import RFCommand from "../commandClass";
import { ApplicationCommandOptionType, Client, ChatInputCommandInteraction } from "discord.js";
import { config } from "../../modules/config";
import Queue, { queueMapType } from "../../musicHandler/queue";
import { basicEmbed, colorPalette } from "../../modules/responses";

export default class MoveCommand extends RFCommand {
    constructor(client: Client) {
        super(client)
    }

    slashInfo = {
        name: 'move',
        description: "🔋 Mover una pista de una posición en la cola a otra.",
        options: [
            {
                name: "track",
                description: "La posición en la cola de la pista a mover.",
                type: ApplicationCommandOptionType.Integer,
                required: true
            },
            {
                name: "new_position",
                description: "La nueva posición en la cola para mover la pista.",
                type: ApplicationCommandOptionType.Integer,
                required: true
            },
        ]
    }

    async callback(interaction: ChatInputCommandInteraction, config: config, queueMap: queueMapType) {
        return new Promise(async (res, rej) => {

            const guild = interaction.guild
            const oldIndex = interaction.options.getInteger('track', true) - 1 // 0-Based Index
            const newIndex = interaction.options.getInteger('new_position', true) - 1 // 0-Based Index

            const result = await new Queue(interaction.client, queueMap).move(guild.id, oldIndex, newIndex)

            if (result) {
                return interaction.editReply({ embeds: [ basicEmbed( `<:xdda:1013896171409907783> Movido [${result.title}](${result.source}) por ${"`"}${result.author}${"`"} en posicion ${"`"}${newIndex + 1}${"`"}.`, colorPalette.success ) ] })
            } else {
                return interaction.editReply({ embeds: [ basicEmbed( `<:xdda:1013166313583161351> No se pudo mover la pista solicitada a la posición. ${newIndex + 1}.`, colorPalette.error ) ] })
            }

        })
    }
}
