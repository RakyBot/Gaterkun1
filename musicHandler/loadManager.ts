import { Client, Snowflake } from "discord.js"
import { AudioPlayerStatus, getVoiceConnection, VoiceConnectionStatus } from "@discordjs/voice"
import Queue, { QueueEntry } from "./queue"

// Reference States
import states from "./stateManager"
import mapMutator from "./mapMutator"

// Base function
// To load songs and listen for player state changes

export async function loader(Queue: Queue, guildId: Snowflake) {
    const guildQueue = Queue.queueMap.get(guildId)
    if (!guildQueue) return;


    if (states.can.play(guildQueue)) { // The bot can do this action

        if (guildQueue.settings.trackLoop) {

            await Queue.goto(guildId, guildQueue.currentTrack); // Go to current
            return;
            
        } else if (guildQueue.settings.queueLoop) {

            if ((guildQueue.currentTrack + 1 /* convert from index to count */) == guildQueue.queue.length) { // We've reached the last song

                await Queue.goto(guildId, 0); // Go back to start
                return;

            } else {

                await Queue.goto(guildId, guildQueue.currentTrack + 1); // Go to next
                return;

            }

        } else if (guildQueue.settings.shuffle) {

            const queueLength = guildQueue.queue.length

            let trackIndexArray: number[] = []

            for (const [index, track] of guildQueue.queue.entries()) {

                if (!track.shufflePlayed) {
                    trackIndexArray.push(index)
                }

                continue;

            }

            if (trackIndexArray.length == 0) { // We've shuffled through all the songs in the queue.

                for (const [index, track] of guildQueue.queue.entries()) {
                    mapMutator.setTrackShuffleState(Queue.queueMap, guildId, index, false); // reset the shuffle state of all songs so we can loop through again.
                }
                return;

            }

            const max = trackIndexArray.length - 1 // 0-based index
            const min = 0


            const randomTrack = trackIndexArray[Math.floor(Math.random() * (max - min) + min)];
            await Queue.goto(guildId, randomTrack); // Go to random number

            return;

        } else {

            if (guildQueue.queue[guildQueue.currentTrack + 1]) {
                await Queue.goto(guildId, guildQueue.currentTrack + 1); // Go to next
                return;
            }

        }
    
    }

}
