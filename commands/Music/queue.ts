import RFCommand from "../commandClass";
import { Client, ChatInputCommandInteraction, Message } from "discord.js";
import { config } from "../../modules/config";
import Queue, { queueMapType } from "../../musicHandler/queue";
import { basicEmbed, colorPalette } from "../../modules/responses";
import { AudioPlayerStatus } from "@discordjs/voice";

export default class QueueCommand extends RFCommand {
    constructor(client: Client) {
        super(client)
    }

    slashInfo = {
        name: 'queue',
        description: "💎 Ver las canciones actual puestas",
    }

    async callback(interaction: ChatInputCommandInteraction, config: config, queueMap: queueMapType) {
        return new Promise(async (res, rej) => {

            const guild = interaction.guild
            const botMember = await guild.members.fetch(interaction.client.user.id).catch((err) => { throw err; })
            const queue = new Queue(interaction.client, queueMap)
            const guildQueue = queue.queueMap.get(guild.id)
            const result = queue.constructEmbed(guild.id)
                if (!result || !guildQueue) return await interaction.editReply({ embeds: [ basicEmbed( `<:xdda:1013162318764449883> Ocurrió un error al obtener la lista de musica.`, colorPalette.error ) ] }).catch((err) => { throw err; });
            
            let queueStatus: string
            if (guildQueue.settings.trackLoop) {
                queueStatus = "<:xdda:1013165735431901276> Bucle de la pista actual."
            } else if (guildQueue.settings.queueLoop) {
                queueStatus = "<:xdda:1013165735431901276> Reproduciendo las canciones."
            } else if (guildQueue.settings.shuffle) {
                queueStatus = "<:xdda:1013165735431901276> Reproduciendo las canciones..."
            }else {
                queueStatus = "<:xdda:1013165202944032859> Sin bucles."
            }

            if (guildQueue.player.state.status === AudioPlayerStatus.Paused) {
                queueStatus = queueStatus.concat(`\n <:xdda:1013162815109992448> Las canciones está actualmente en pausa.`)
            }

            let timeRemaining: string = "`No track is currently playing.`"
            if (guildQueue.player.state.status === AudioPlayerStatus.Playing) {
                function fmtMSS(s: number){return(s-(s%=60))/60+(9<s?':':':0')+s} // Seconds -> M:SS (Minutes: Seconds)
                const currentTrack = guildQueue.queue[guildQueue.currentTrack]
                timeRemaining = currentTrack ? `${"`"}${fmtMSS(Math.floor(guildQueue.currentResource.resource.playbackDuration / 1000) + guildQueue.currentResource.savedPassedTime)}${"`"}/${"`"}${fmtMSS(Number(currentTrack.duration))}${"`"}` : "`No se está reproduciendo ninguna pista actualmente.`"
            }

            const queueEmbed = {
                color: colorPalette.default,
                title: "Cola de seguimiento",
                description: `Channel: <#${botMember.voice.channelId}>\n${queueStatus}\n${timeRemaining}`,
                fields: result.trackArray[result.currentPage - 1],
                footer: {
                    text: `Page ${result.currentPage} of ${result.pageCount}.`
                }
            }

            const reply = await interaction.editReply({ embeds: [ queueEmbed ], components: [ result.actionRow ] }).catch(err => {}) as Message

            queue.registerEmbed(guild.id, reply.id, interaction.user.id, result.currentPage, result.pageCount, result.trackArray.length)

        })
    }
}
