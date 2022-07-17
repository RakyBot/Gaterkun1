import { AudioPlayer, createAudioPlayer, NoSubscriberBehavior, createAudioResource, getVoiceConnection } from "@discordjs/voice";
import { Client, Snowflake } from "discord.js";
import play from 'play-dl'
import mapMutator from "./mapMutator";
import queryFilter from "./queryFilter";
import stateManager from './stateManager'

export type TrackEntry = {
    title: string,
    author: string,
    sourceType: "DISCORD" | "YOUTUBE",
    source: string,
}

export type QueueEntry = {
    guildId: Snowflake,
    client: Client,
    queue: TrackEntry[],
    currentTrack: number,
    player: AudioPlayer,
    settings: {
        trackLoop: boolean,
        queueLoop: boolean,
    }
}


export type queueMapType = Map<Snowflake, QueueEntry>

export async function createResource(track: TrackEntry) {
    if (track.sourceType == "YOUTUBE") {
        let stream = await play.stream(track.source)
        return createAudioResource(stream.stream, {
            inputType: stream.type,
        });
    } else if (track.sourceType == "DISCORD") {
        return createAudioResource(track.source);
    }
}

export default class Queue { // NOTE: Each module is expected to do its own safety checks to make sure that everything works properly.

    client: Client
    queueMap: queueMapType

    constructor(client: Client, queueMap: queueMapType) {
        this.client = client
        this.queueMap = queueMap
    }

    async init(queueMap: queueMapType) { // Run on start
        for (const [index, guild] of Array.from(this.client.guilds.cache.entries())) { // Initialize the queues
            queueMap.set(guild.id, {
                guildId: guild.id,
                client: this.client,
                queue: [],
                currentTrack: 0,
                player: createAudioPlayer({
                    behaviors: {
                        noSubscriber: NoSubscriberBehavior.Pause, // Pause if there is no active connection
                    }
                }),
                settings: {
                    trackLoop: false,
                    queueLoop: false,
                }
            })
        }

        return true;
    }

    async add(guildId: Snowflake, query: string): Promise<number | boolean> {
        const guildQueue = this.queueMap.get(guildId)
        if (guildQueue) {
            if (stateManager.can.add(guildQueue)) { // *preferably test the systems after this is done before continuing*

                const entries = await queryFilter.getEntry(query) // Filter the queries and return links (queryFilter.ts)
                    if (!entries) return false;
                
                let count = 0

                for (const track of entries) {
                    mapMutator.insertTrack(this.queueMap, guildId, track) // Mutate the map (mapMutater.ts)
                    count++
                }

                if (guildQueue.player.state.status == 'idle') {
                    console.log('helping')

                    await this.goto(guildId, 0) // if the bot is just starting give it a bit of a push

                }
                
                return count;

            }
        }
    }

    remove() {

    }

    move() {

    }

    resume() {

    }
    
    pause() {

    }

    clear(guildId: Snowflake) {
        // Reset the queue settings and the queue itself.
    }

    async goto(guildId: Snowflake, index: number): Promise<boolean> {
        const guildQueue = this.queueMap.get(guildId)
        if (guildQueue) {
            if (stateManager.can.play(guildQueue)) {

                const queue = guildQueue.queue
                if (queue[index]) {

                    return await this.loadTrack(guildId, index);
                    
                }

            }
        }
    }

    async loadTrack(guildId: Snowflake, position: number): Promise<boolean> {
        const guildQueue = this.queueMap.get(guildId)
        if (guildQueue) {
            if (stateManager.can.add(guildQueue)) { // *preferably test the systems after this is done before continuing*
                console.log('resource being added')

                const resource = await createResource(guildQueue.queue[position]) // Load the resource
                guildQueue.player.play(resource) // Play the resource being loaded

                const connection = getVoiceConnection(guildId)
                if (connection) {
                    connection.subscribe(guildQueue.player)
                }

                console.log('voice connection status: ', getVoiceConnection(guildId).state.status)

                mapMutator.changeCurrentTrack(this.queueMap, guildId, position) // Mutate the map (currentTrack)

                console.log('player status: ', guildQueue.player.state.status)

                return true;

            }
        }
    }

}
