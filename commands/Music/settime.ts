import RFCommand from "../commandClass";
import { ApplicationCommandOptionType, Client, ChatInputCommandInteraction } from "discord.js";
import { config } from "../../modules/config";
import Queue, { queueMapType } from "../../musicHandler/queue";
import { basicEmbed, colorPalette } from "../../modules/responses";

export default class SetTimeCommand extends RFCommand {
    constructor(client: Client) {
        super(client)
    }

    slashInfo = {
        name: 'settime',
        description: "😺 Establece la cancion a un tiempo específico.",
        options: [
            {
                name: "time",
                description: "⌛ La cantidad de tiempo (segundos) para configurar la pista que se está reproduciendo actualmente.",
                type: ApplicationCommandOptionType.Integer,
                required: true
            },
        ],
    }

    async callback(interaction: ChatInputCommandInteraction, config: config, queueMap: queueMapType) {
        return new Promise(async (res, rej) => {

            const guild = interaction.guild
            const guildQueue = queueMap.get(guild.id)
                if (!guildQueue) return;
            const time = interaction.options.getInteger('time')


            const result = await new Queue(interaction.client, queueMap).loadTrack(guild.id, guildQueue.currentTrack, time)

            if (result) {
                return interaction.editReply({ embeds: [ basicEmbed( `<:xdda:1013165202944032859> Establezca el tiempo para ${time} segundos.`, colorPalette.trackOperation ) ] })
            } else {
                return interaction.editReply({ embeds: [ basicEmbed( `<:xdda:1013162318764449883> No se pudo ir a ese minuto.`, colorPalette.error ) ] })
            }

        })
    }
}
