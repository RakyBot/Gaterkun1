import RFCommand from "../commandClass";
import { Client, CommandInteraction, GuildMember } from "discord.js";
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
        description: "Play a track.",
        options: [
            {
                name: "query",
                description: "Search Query (YouTube, Spotify).",
                type: "STRING",
                required: true
            },
        ]
    }

    async callback(interaction: CommandInteraction, config: config, queueMap: queueMapType) {
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

            if (clientMember.voice.channelId && (clientMember.voice.channelId != author.voice.channelId)) return interaction.editReply(`Please disconnect me from the voice channel I am currently in, or join that voice channel to queue a track.`)
            
            const result = await new Queue(interaction.client, queueMap).add(guild.id, query)

            if (result) {
                return interaction.editReply({ embeds: [ basicEmbed( result, colorPalette.trackOperation ) ] })
            } else {
                return interaction.editReply({ embeds: [ basicEmbed( `🛑｜Error queueing track(s).`, colorPalette.error ) ] })
            }
            

        })
    }
}
