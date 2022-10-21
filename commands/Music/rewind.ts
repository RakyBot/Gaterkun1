import RFCommand from "../commandClass";
import { ApplicationCommandOptionType, Client, ChatInputCommandInteraction } from "discord.js";
import { config } from "../../modules/config";
import Queue, { queueMapType } from "../../musicHandler/queue";
import { basicEmbed, colorPalette } from "../../modules/responses";

export default class RewindCommand extends RFCommand {
    constructor(client: Client) {
        super(client)
    }

    slashInfo = {
        name: 'rewind',
        description: "🎚️ Rebobina la pista que se está reproduciendo actualmente.",
        options: [
            {
                name: "time",
                description: "La cantidad de tiempo (segundos) para rebobinar la pista que se está reproduciendo actualmente.",
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
            const timePassed = Math.floor(guildQueue.currentResource.resource.playbackDuration / 1000) + guildQueue.currentResource.savedPassedTime
            
            if (time < 1) return interaction.editReply({ embeds: [ basicEmbed( `<:xdda:1013896171409907783> Introduzca un tiempo superior a 0 segundos.`, colorPalette.error ) ] })


            const result = await new Queue(interaction.client, queueMap).loadTrack(guild.id, guildQueue.currentTrack, timePassed - time) // Negative time because we're rewinding
            if (result) {
                return interaction.editReply({ embeds: [ basicEmbed( `<:xdda:1013182506461302885> Rebobinado la pista ${time} segundos.`, colorPalette.trackOperation ) ] })
            } else {
                return interaction.editReply({ embeds: [ basicEmbed( `<:xdda:1013162318764449883> No se pudo rebobinar hasta ese momento.`, colorPalette.error ) ] })
            }

        })
    }
}
