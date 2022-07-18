import { AudioPlayer, createAudioPlayer, NoSubscriberBehavior, createAudioResource, getVoiceConnection, AudioPlayerStatus } from "@discordjs/voice";
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
    },
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
    async initGuild(guildId: Snowflake) {
        this.queueMap.set(guildId, {
            guildId: guildId,
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

        return true;
    }

    async add(guildId: Snowflake, query: string): Promise<false | string> {
        const guildQueue = this.queueMap.get(guildId)
        if (guildQueue) {
            if (await stateManager.can.add(guildQueue)) {

                const entries = await queryFilter.getEntry(query) // Filter the queries and return links (queryFilter.ts)
                    if (!entries) return false;
                
                let count = 0

                for (const track of entries) {
                    mapMutator.insertTrack(this.queueMap, guildId, track) // Mutate the map (mapMutater.ts)
                    count++
                }

                if (guildQueue.player.state.status == 'idle') {
                    await this.goto(guildId, guildQueue.currentTrack) // If the bot is just starting or had no next track, it needs a trigger to start.
                }
                
                if (count > 1) {
                    return `Queued ${count} tracks.`;
                } else {
                    return `Queued ${entries[0].title} by ${"`"}${entries[0].author}${"`"}.`
                }
                

            }
        }
    }

    async remove(guildId: Snowflake, index: number): Promise<boolean> { // Expects a 0-based index
        const guildQueue = this.queueMap.get(guildId)
        if (guildQueue) {
            if (await stateManager.can.remove(guildQueue)) {

                if (index >= 0) {
                    mapMutator.deleteTrack(this.queueMap, guildId, index); // Delete the track

                    if (guildQueue.currentTrack == index) { // Current track is being removed

                        if (guildQueue.queue[guildQueue.currentTrack]) { // if a next track exists, go to it

                            await this.goto(guildId, guildQueue.currentTrack);
                        
                        } else { // if this is the last track, enter the bot into idle state

                            guildQueue.player.stop();

                        }
                    
                    } else if (guildQueue.currentTrack > index) { // Current Track is after the removed track

                        await this.goto(guildId, guildQueue.currentTrack - 1);

                    }

                }

                return true;
            }
        }

        return false;

    }

    async move(guildId: Snowflake, oldIndex: number, newIndex: number): Promise<boolean> {

        const guildQueue = this.queueMap.get(guildId)
        if (guildQueue) {
            if (await stateManager.can.move(guildQueue)) {

                if (guildQueue.queue[oldIndex]) { // valid track

                    if (newIndex <= (guildQueue.queue.length - 1)) { // prevent blank space from existing in the queue

                        if (guildQueue.currentTrack == oldIndex) { // Reference where the current track is going

                            mapMutator.changeCurrentTrack(this.queueMap, guildId, newIndex);

                        }

                        mapMutator.moveTrack(this.queueMap, guildId, oldIndex, newIndex);

                        return true;

                    }

                }

            }
        }

        return false;

    }

    async resume(guildId: Snowflake) {
        const guildQueue = this.queueMap.get(guildId)
        if (guildQueue) {

            if (await stateManager.can.resume(guildQueue)) {

                guildQueue.player.unpause();
                return true;

            }

        }

        return false;

    }
    
    async pause(guildId: Snowflake) {
        const guildQueue = this.queueMap.get(guildId)
        if (guildQueue) {

            if (await stateManager.can.pause(guildQueue)) {

                guildQueue.player.pause();
                return true;

            }

        }

        return false;
    }

    clear(guildId: Snowflake, settings?: boolean) { // Are we clearing the settings for the guild too?
        const guildQueue = this.queueMap.get(guildId)
            if (!guildQueue) return false;
        
        if (settings) {

            this.queueMap.set(guildId, {
                guildId: guildId,
                client: this.client,
                queue: [],
                currentTrack: 0,
                player: guildQueue.player,
                settings: {
                    trackLoop: false,
                    queueLoop: false,
                },
            })

        } else {

            this.queueMap.set(guildId, {
                guildId: guildId,
                client: this.client,
                queue: [],
                currentTrack: 0,
                player: guildQueue.player,
                settings: {
                    trackLoop: guildQueue.settings.trackLoop,
                    queueLoop: guildQueue.settings.queueLoop,
                },
            })

        }
        
        return true;
    }

    async printQueue(guildId: Snowflake) {
        const guildQueue = this.queueMap.get(guildId)
        if (guildQueue) {
            console.log(guildQueue.queue)
            console.log("Current Track Index: ", guildQueue.currentTrack)
            let titles = []
            for (const track of guildQueue.queue) {

                titles.push(track.title)

            }
            return titles.join()
        }
    }

    async goto(guildId: Snowflake, index: number): Promise<boolean> {
        const guildQueue = this.queueMap.get(guildId)
        if (guildQueue) {
            if (await stateManager.can.play(guildQueue)) {

                const queue = guildQueue.queue
                if (queue[index]) {

                    const trackLoad = await this.loadTrack(guildId, index);
                    if (trackLoad) {
                        mapMutator.changeCurrentTrack(this.queueMap, guildId, index);
                    }
                    return trackLoad
                    
                } else {

                    return false;

                }

            }
        }
    }

    async loadTrack(guildId: Snowflake, position: number): Promise<boolean> {
        const guildQueue = this.queueMap.get(guildId)
        if (guildQueue) {
            if (stateManager.can.add(guildQueue)) {
                
                console.log('LOADTRACK: Loading the resource')
                const resource = await createResource(guildQueue.queue[position]) // Load the resource
                guildQueue.player.play(resource) // Play the resource being loaded

                const connection = getVoiceConnection(guildId)
                if (connection) {
                    connection.subscribe(guildQueue.player)
                }

                mapMutator.changeCurrentTrack(this.queueMap, guildId, position) // Mutate the map (currentTrack)

                return true;

            }
        }
    }

}
