import RFCommand from "../commandClass";
import { ApplicationCommandOptionType, Client, ChatInputCommandInteraction } from "discord.js";
import { config } from "../../modules/config";
import Queue, { queueMapType } from "../../musicHandler/queue";
import { basicEmbed, colorPalette } from "../../modules/responses";

export default class RemoveCommand extends RFCommand {
    constructor(client: Client) {
        super(client)
    }

    slashInfo = {
        name: 'remove',
        description: "🔉 Eliminar una pista de la lista de musica.",
        options: [
            {
                name: "position",
                description: "La posición en la cola de la pista a eliminar",
                type: ApplicationCommandOptionType.Integer,
                required: true
            }
        ],
    }

    async callback(interaction: ChatInputCommandInteraction, config: config, queueMap: queueMapType) {
        return new Promise(async (res, rej) => {

            const guild = interaction.guild
            const position = interaction.options.getInteger('position', true) - 1
            const guildQueue = queueMap.get(guild.id)
                if (!guildQueue) return interaction.editReply("Could not remove the track.")
            const result = await new Queue(interaction.client, queueMap).remove(interaction.guildId, position)

            if (result) {
                return interaction.editReply({ embeds: [ basicEmbed( `<:xda:1013166313583161351> Eliminado [${result.title}](${result.source}) by ${"`"}${result.author}${"`"}`, colorPalette.trackOperation ) ] })
            } else {
                return interaction.editReply({ embeds: [ basicEmbed( `<:xdda:1013165202944032859> No hay lista de musica en ${"`"}${position + 1}${"`"}. Please select a number ${"`"}1${"`"} - ${"`"}${guildQueue.queue.length}${"`"}.`, colorPalette.error ) ] })
            }

        })
    }
}
