import RFCommand from "../commandClass";
import { Client, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { config } from "../../modules/config";
import { getVoiceConnection } from "@discordjs/voice";
import { basicEmbed, colorPalette } from "../../modules/responses";

export default class DisconnectCommand extends RFCommand {
    constructor(client: Client) {
        super(client)
    }

    slashInfo = {
        name: 'disconnect',
        description: "💡 Pídeme que me desconecte de tu canal."
    }

    async callback(interaction: ChatInputCommandInteraction, config: config) {
        return new Promise(async (res, rej) => {

            const guild = interaction.guild
            const member = interaction.member as GuildMember
            const clientMember = await guild.members.fetch(this.client.user.id).catch((err) => { throw err })

            const connection = getVoiceConnection(guild.id)
            const voiceChannel = clientMember.voice.channel

            if (clientMember.voice.channelId == member.voice.channelId) {

                connection.destroy()

            } else {

                return res(interaction.editReply("¡Únete a mi canal de voz para usar esta función!"))

            }
            
            return interaction.editReply({ embeds: [ basicEmbed( `<:xdda:1013164546455769168> Desconectado.`, colorPalette.trackOperation ) ] })


        })
    }
}
