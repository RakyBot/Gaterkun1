import { Client } from "discord.js"
import { AudioPlayerStatus, getVoiceConnection } from "@discordjs/voice"
import Queue from "./queue"

// Reference States
import states from "./stateManager"


// To load songs and listen for player state changes
export default {
    async checkLoop(client: Client, Queue: Queue) {
      
        for await (const [index, guild] of Array.from(client.guilds.cache.entries())) {
            console.log('load check loop run for guild ', guild.id)

            const guildQueue = Queue.queueMap.get(guild.id)
                if (!guildQueue) return;

            const player = guildQueue.player

            let timer: NodeJS.Timeout
            player.on(AudioPlayerStatus.Idle, async () => { // (EVENT LISTENER) Go to next track
                console.log("player is idle")

                if (states.can.play(guildQueue)) { // The bot can do this action
                    console.log('player is ready to play')

                    if (guildQueue.settings.trackLoop) {

                        await Queue.goto(guild.id, guildQueue.currentTrack); // Go to current
                        return;
                        
                    } else if (guildQueue.settings.queueLoop) {

                        if ((guildQueue.currentTrack + 1 /* convert from index to count */) == guildQueue.queue.length) { // We've reached the last song

                            await Queue.goto(guild.id, 0); // Go back to start
                            return;

                        } else {

                            await Queue.goto(guild.id, guildQueue.currentTrack + 1); // Go to next
                            return;

                        }

                    } else {

                        await Queue.goto(guild.id, guildQueue.currentTrack + 1); // Go to next
                        return;

                    }
                
                }

                timer = setTimeout(() => {
                    Queue.clear(guild.id)
                    getVoiceConnection(guild.id).destroy();
                    return;
                }, (parseInt(process.env.TIMEOUT_MS))) // Auto timeout

            })

            
            player.on(AudioPlayerStatus.Playing, async () => {
                clearTimeout(timer);
                return;
            })
        }
    }
}
