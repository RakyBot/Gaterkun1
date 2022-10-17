import { AudioPlayerStatus, createAudioPlayer, getVoiceConnection, NoSubscriberBehavior } from "@discordjs/voice";
import { Client, VoiceState } from "discord.js";
import { loader } from "../musicHandler/loadManager";
import mapMutator from '../musicHandler/mapMutator'
import Queue, { queueMapType } from "../musicHandler/queue";

export default async function joinChannel(client: Client, queueMap: queueMapType, oldState: VoiceState, newState: VoiceState) {

    if (newState.member.user.id != client.user.id) return; // Only run this module for the bot client.

    const guild = newState.guild
    const queue = new Queue(client, queueMap)

    if (newState.channelId != undefined) {

        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause, // Pause if there is no active connection
            }
        })

        mapMutator.setPlayer(queueMap, guild.id, player) // Set the new player instance

        // Event Listeners
        let timer: NodeJS.Timeout
        player.on(AudioPlayerStatus.Idle, async () => {

            await loader(queue, guild.id)

            timer = setTimeout(() => {
                queue.clear(guild.id, true)
                try {
                    getVoiceConnection(guild.id).destroy();
                    queue.clear(guild.id); // Clear the queue on timeout
                } catch(e) {
                    console.warn(`Could not find the bot connection for guild ${guild.id}`)
                }
                
                return;
            }, (parseInt(process.env.TIMEOUT_MS))) // Auto timeout

        })


        player.on(AudioPlayerStatus.Playing, async () => {
            clearTimeout(timer);
            return;
        })

    }

}
