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
        description: "Ask me to connect to your channel.",
        options: [
            {
                name: "channel",
                description: "Choose a different channel for me to connect to.",
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

                return res(interaction.editReply("Please join a voice channel to use this feature!"))

            }
             

            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guildId,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator
            })


            return res(interaction.editReply({ embeds: [ basicEmbed( `🚪｜Joined <#${voiceChannel.id}>.`, colorPalette.trackOperation ) ] }))

        })
    }
}
