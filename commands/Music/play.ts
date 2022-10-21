import RFCommand from "../commandClass";
import { ApplicationCommandOptionType, Client, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { joinVoiceChannel } from "@discordjs/voice";
import { config } from "../../modules/config";
import Queue, { queueMapType } from "../../musicHandler/queue";
import { basicEmbed, colorPalette } from "../../modules/responses";

export default class PlayCommand extends RFCommand {
    constructor(client: Client) {
        super(client)
    }

    slashInfo = {
        name: 'play',
        description: "🎧 Reproducir canciones.",
        options: [
            {
                name: "query",
                description: "Consulta de busqueda (YouTube Music).",
                type: ApplicationCommandOptionType.String,
                required: true
            },
        ]
    }

    async callback(interaction: ChatInputCommandInteraction, config: config, queueMap: queueMapType) {
        return new Promise(async (res, rej) => {

            const guild = interaction.guild
            const query = interaction.options.getString('query')
            const clientMember = await guild.members.fetch(interaction.client.user.id).catch((err) => { throw err; })
            const author = interaction.member as GuildMember
            
            if (!clientMember.voice.channelId) joinVoiceChannel({
                channelId: author.voice.channelId,
                guildId: interaction.guildId,
                adapterCreator: author.voice.channel.guild.voiceAdapterCreator
            })

            if (clientMember.voice.channelId && (clientMember.voice.channelId != author.voice.channelId)) return interaction.editReply(`Desconécteme del canal de voz en el que estoy actualmente o únase a ese canal de voz para poner en cola una pista.`)
            
            const result = await new Queue(interaction.client, queueMap).add(guild.id, query)

            if (result) {
                return interaction.editReply({ embeds: [ basicEmbed( result, colorPalette.trackOperation ) ] })
            } else {
                return interaction.editReply({ embeds: [ basicEmbed( `<:xdda:1013166313583161351> Error al poner en cola las pistas.`, colorPalette.error ) ] })
            }
            

        })
    }
}
