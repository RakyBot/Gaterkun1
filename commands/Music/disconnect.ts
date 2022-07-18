import RFCommand from "../commandClass";
import { Client, CommandInteraction, GuildMember } from "discord.js";
import { config } from "../../modules/config";
import { getVoiceConnection } from "@discordjs/voice";

export default class DisconnectCommand extends RFCommand {
    constructor(client: Client) {
        super(client)
    }

    slashInfo = {
        name: 'disconnect',
        description: "Ask me to disconnect from your channel."
    }

    async callback(interaction: CommandInteraction, config: config) {
        return new Promise(async (res, rej) => {

            const guild = interaction.guild
            const member = interaction.member as GuildMember
            const clientMember = await guild.members.fetch(this.client.user.id).catch((err) => { throw err })

            const connection = getVoiceConnection(guild.id)
            const voiceChannel = clientMember.voice.channel

            if (clientMember.voice.channelId == member.voice.channelId) {

                connection.destroy()

            } else {

                return res(interaction.editReply("Please join my voice channel to use this feature!"))

            }
             
            return res(interaction.editReply(`Disconnected from <#${voiceChannel.id}>.`))

        })
    }
}
