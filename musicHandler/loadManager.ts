import { Client, Snowflake } from "discord.js"
import { AudioPlayerStatus, getVoiceConnection } from "@discordjs/voice"
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

function listeners(client: Client, Queue: Queue, guildId: Snowflake) {
    const guildQueue = Queue.queueMap.get(guildId)
        if (!guildQueue) return;

    const player = guildQueue.player

    let timer: NodeJS.Timeout
    player.on(AudioPlayerStatus.Idle, async () => { // (EVENT LISTENER) Go to next track

        await loader(Queue, guildId)

        timer = setTimeout(() => {
            Queue.clear(guildId, true)
            try {
                getVoiceConnection(guildId).destroy();
            } catch(e) {
                console.warn(`Could not find the bot connection for guild ${guildId}`)
            }
            
            return;
        }, (parseInt(process.env.TIMEOUT_MS))) // Auto timeout

    })


    player.on(AudioPlayerStatus.Playing, async () => {
        clearTimeout(timer);
        return;
    })
}

///////////////////////////////////////////////////////////

export default {
    async checkLoop(client: Client, Queue: Queue) {
      
        for await (const [index, guild] of Array.from(client.guilds.cache.entries())) {
            listeners(client, Queue, guild.id)
        }
    },

    async addGuild(client: Client, Queue: Queue, guildId: Snowflake) {
        listeners(client, Queue, guildId)
    }
}
