import RFCommand from "../commandClass";
import { Client, CommandInteraction, GuildMember, VoiceChannel } from "discord.js";
import { config } from "../../modules/config";
import { joinVoiceChannel } from "@discordjs/voice";

export default class JoinCommand extends RFCommand {
    constructor(client: Client) {
        super(client)
    }

    slashInfo = {
        name: 'join',
        description: "Ask me to join your channel.",
        options: [
            {
                name: "channel",
                description: "Choose a different channel for me to join.",
                type: "CHANNEL",
                required: false
            },
        ]
    }

    async callback(interaction: CommandInteraction, config: config) {
        return new Promise(async (res, rej) => {

            const guild = interaction.guild
            const channel = interaction.options.getChannel('channel')
            const member = interaction.member as GuildMember

            let voiceChannel: VoiceChannel
            if (channel && channel.type == "GUILD_VOICE") {

                voiceChannel = channel

            } else if (member.voice.channel && member.voice.channel.type == "GUILD_VOICE") {

                voiceChannel = member.voice.channel

            } else {

                return res(interaction.editReply("Please join a voice channel to use this feature!"))

            }
             

            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guildId,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator
            })

            return res(interaction.editReply(`Joined <#${voiceChannel.id}>.`))

        })
    }
}
