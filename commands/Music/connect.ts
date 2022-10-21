import RFCommand from "../commandClass";
import { ApplicationCommandOptionType, ChannelType, Client, ChatInputCommandInteraction, GuildMember, Snowflake, VoiceChannel } from "discord.js";
import { config } from "../../modules/config";
import { joinVoiceChannel } from "@discordjs/voice";
import { basicEmbed, colorPalette } from "../../modules/responses";

export default class ConnectCommand extends RFCommand {
    constructor(client: Client) {
        super(client)
    }

    slashInfo = {
        name: 'connect',
        description: "Pídeme que me conecte a tu canal.",
        options: [
            {
                name: "channel",
                description: "Elija un canal diferente para que me conecte.",
                type: ApplicationCommandOptionType.Channel,
                required: false
            },
        ]
    }

    async callback(interaction: ChatInputCommandInteraction, config: config) {
        return new Promise(async (res, rej) => {

            const guild = interaction.guild
            const channel = interaction.options.getChannel('channel') as VoiceChannel
            const member = interaction.member as GuildMember

            let voiceChannel: VoiceChannel
            if (channel && channel.type == ChannelType.GuildVoice) {

                voiceChannel = channel

            } else if (member.voice.channel && member.voice.channel.type == ChannelType.GuildVoice) {

                voiceChannel = member.voice.channel

            } else {

                return res(interaction.editReply("¡Únase a un canal de voz para usar esta función!"))

            }
             

            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guildId,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator
            })


            return res(interaction.editReply({ embeds: [ basicEmbed( `<:xdda:1013160472415047710> Unido <#${voiceChannel.id}>.`, colorPalette.trackOperation ) ] }))

        })
    }
}
