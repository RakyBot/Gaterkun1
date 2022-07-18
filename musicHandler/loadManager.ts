import { Client, Snowflake } from "discord.js"
import { AudioPlayerStatus, getVoiceConnection } from "@discordjs/voice"
import Queue from "./queue"

// Reference States
import states from "./stateManager"

// Base function
// To load songs and listen for player state changes
function listeners(client: Client, Queue: Queue, guildId: Snowflake) {
    const guildQueue = Queue.queueMap.get(guildId)
    if (!guildQueue) return;

    const player = guildQueue.player

    let timer: NodeJS.Timeout
    player.on(AudioPlayerStatus.Idle, async () => { // (EVENT LISTENER) Go to next track

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

            } else {

                await Queue.goto(guildId, guildQueue.currentTrack + 1); // Go to next
                return;

            }
        
        }

        timer = setTimeout(() => {
            Queue.clear(guildId)
            getVoiceConnection(guildId).destroy();
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
