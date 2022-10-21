import { AudioPlayer, createAudioPlayer, NoSubscriberBehavior, createAudioResource, getVoiceConnection, AudioPlayerStatus, AudioResource } from "@discordjs/voice";
import { Client, ActionRowBuilder, ButtonBuilder, Snowflake, ButtonStyle, APIActionRowComponent, TextChannel } from "discord.js";
import play from 'play-dl'
import { basicEmbed, colorPalette } from "../modules/responses";
import { loader } from "./loadManager";
import mapMutator from "./mapMutator";
import queryFilter from "./queryFilter";
import stateManager from './stateManager'

export type TrackEntry = {
    title: string,
    author: string,
    duration: number,
    sourceType: "DISCORD" | "YOUTUBE",
    source: string,
    shufflePlayed: boolean, // For the shuffle feature, to prevent songs from repeating themselves.
}

export type activeEmbed = {
    messageId: Snowflake,
    authorId: Snowflake,
    pageCount: number,
    currentPage: number,
    trackCount: number,
    lastUsed: number,
}

export type QueueEntry = {
    guildId: Snowflake,
    client: Client,
    queue: TrackEntry[],
    currentTrack: number,
    currentResource: {
        resource: AudioResource,
        savedPassedTime: number,
    },
    player: AudioPlayer,
    activeEmbeds: activeEmbed[],
    songUpdateChannel: Snowflake,
    settings: {
        trackLoop: boolean,
        queueLoop: boolean,
        shuffle: boolean,
    },
}

export type queueMapType = Map<Snowflake, QueueEntry>

export async function createResource(track: TrackEntry, seek?: number) {
    if (track.sourceType == "YOUTUBE") {
        let stream = await play.stream(track.source, {
            seek: seek ? seek : 0,
        }).catch(err => {
            throw err;
        })
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

    getDefaultGuildEntry(guildId: Snowflake, settings?: { trackLoop: boolean, queueLoop: boolean, shuffle: boolean, }) {
        let entry = {
            guildId: guildId,
            client: this.client,
            queue: [],
            currentTrack: -1,
            currentResource: undefined,
            player: createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Pause, // Pause if there is no active connection
                }
            }),
            activeEmbeds: [],
            songUpdateChannel: "",
            settings: {
                trackLoop: false,
                queueLoop: false,
                shuffle: false,
            },
        } as QueueEntry
    
        if (settings) entry.settings = settings
    
        return entry
    }

    async init(queueMap: queueMapType) { // Run on start
        for (const [index, guild] of Array.from(this.client.guilds.cache.entries())) { // Initialize the queues
            queueMap.set(guild.id, this.getDefaultGuildEntry(guild.id))
        }

        return true;
    }
    async initGuild(guildId: Snowflake) {
        this.queueMap.set(guildId, this.getDefaultGuildEntry(guildId))

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
                    await loader(this, guildId) // Ask the loader to handle if there are already songs in the queue
                }
                
                if (count > 1) {
                    return `<:XDD:ID> ｜ $ {count} pistas en cola.`;
                } else {
                    return `📄｜En la lista [${entries[0].title}](${entries[0].source}) by ${"`"}${entries[0].author}${"`"}.`
                }
                

            }
        }
    }

    async remove(guildId: Snowflake, index: number): Promise<TrackEntry | false> { // Expects a 0-based index
        const guildQueue = this.queueMap.get(guildId)
        let removedTrack: TrackEntry
        if (guildQueue) {
            if (await stateManager.can.remove(guildQueue)) {

                if (index >= 0) {
                    removedTrack = guildQueue.queue[index]
                    mapMutator.deleteTrack(this.queueMap, guildId, index); // Delete the track

                    if (guildQueue.queue.length == 0 && guildQueue.currentTrack == 0) { // the first (and only) track of the queue was removed

                        mapMutator.changeCurrentTrack(this.queueMap, guildId, -1); // Reset the queue to -1 so it can start up again
                        guildQueue.player.stop();

                    } else if (guildQueue.currentTrack == index) { // Current track is being removed

                        if (guildQueue.queue[guildQueue.currentTrack]) { // if a next track exists, go to it

                            await this.goto(guildId, guildQueue.currentTrack);
                        
                        } else { // if this is the last track, enter the bot into idle state

                            guildQueue.player.stop();

                        }
                    
                    } else if (guildQueue.currentTrack > index) { // Current Track is after the removed track

                        await this.goto(guildId, guildQueue.currentTrack - 1);

                    }

                }

                return removedTrack;
            }
        }

        return false;

    }

    async move(guildId: Snowflake, oldIndex: number, newIndex: number): Promise<TrackEntry | false> {

        const guildQueue = this.queueMap.get(guildId)
        if (guildQueue) {
            if (await stateManager.can.move(guildQueue)) {

                if (guildQueue.queue[oldIndex]) { // valid track

                    if (newIndex <= (guildQueue.queue.length - 1)) { // prevent blank space from existing in the queue

                        if (guildQueue.currentTrack == oldIndex) { // Reference where the current track is going

                            mapMutator.changeCurrentTrack(this.queueMap, guildId, newIndex);

                        }

                        mapMutator.moveTrack(this.queueMap, guildId, oldIndex, newIndex);

                        return guildQueue.queue[newIndex];

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

    clear(guildId: Snowflake, settings?: boolean) {
        const guildQueue = this.queueMap.get(guildId)
            if (!guildQueue) return false;
        
        if (settings) {

            this.queueMap.set(guildId, this.getDefaultGuildEntry(guildId, {
                trackLoop: guildQueue.settings.trackLoop,
                queueLoop: guildQueue.settings.queueLoop,
                shuffle: guildQueue.settings.shuffle,
            }))

        } else {

            this.queueMap.set(guildId, this.getDefaultGuildEntry(guildId))

        }

        guildQueue.player.stop(); // Stop all tracks playing
        
        return true;
    }


    async printQueue(guildId: Snowflake) {
        const guildQueue = this.queueMap.get(guildId)
        if (guildQueue) {
            let titles = []
            for (const track of guildQueue.queue) {

                titles.push(track.title)

            }
            return titles.join()
        }
    }
    constructEmbed(guildId: Snowflake, startingPage?: number) {
        
        const guildQueue = this.queueMap.get(guildId)
            if (!guildQueue) return false;
        
        let trackArray = [[]]
        let count = 0
        let pageCount = 1
        let currentPage = startingPage ? startingPage : 1
        let currentTrackPage

        for (const [trackIndex, track] of guildQueue.queue.entries()) {

            count++
    
            if (count > 25) {
                pageCount++
                trackArray[pageCount - 1] = [] // make a new array for the page
                count = 0
            }

            if (trackIndex == guildQueue.currentTrack) currentTrackPage = pageCount

            trackArray[pageCount - 1].push({
                name: '\u200b',
                value: `${trackIndex == guildQueue.currentTrack ? `**>> ${trackIndex + 1}:**    [${track.title}](${track.source})` : `**${trackIndex + 1}:**    [${track.title}](${track.source})`}\nBy: ${"`"}${track.author}${"`"}`
            })
    
        }

        if (startingPage > pageCount) return false; // Invalid Page
        if (!startingPage) currentPage = currentTrackPage // Set the page of the current track to be displayed first

        const row = new ActionRowBuilder()
            .addComponents([
    
                // Previous Page Button
                new ButtonBuilder()
                    .setCustomId('previousQueuePage')
                    .setEmoji(`⬅️`)
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage > 1 ? false : true),
                
                // Next Page Button 
                new ButtonBuilder()
                    .setCustomId('nextQueuePage')
                    .setEmoji(`➡️`)
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(((pageCount > 1) && (currentPage < pageCount)) ? false : true),
                
            ]);
    
        return {
            trackArray: trackArray,
            pageCount: pageCount,
            currentPage: currentPage,
            actionRow: row as any // TS Error?
        }

    }
    registerEmbed(guildId: Snowflake, messageId: Snowflake, authorId: Snowflake, currentPage: number, pageCount: number, trackCount: number) {

        const guildQueue = this.queueMap.get(guildId)
            if (!guildQueue) return false;
    
        const timestamp = Math.floor(Date.now() / 1000)
        
        guildQueue.activeEmbeds.push({
            messageId: messageId,
            authorId: authorId,
            pageCount: pageCount,
            currentPage: currentPage,
            trackCount: trackCount,
            lastUsed: timestamp
        })

        this.queueMap.set(guildId, guildQueue)

        return true;

    }
    updateEmbed(guildId: string, messageId: string, currentPage?: number, pageCount?: number, trackCount?: number) {
        
        const queue = this.queueMap.get(guildId)
            if (!queue) return false;
    
        const timestamp = Math.floor(Date.now() / 1000)

        for (const embed of queue.activeEmbeds) {

            if (embed.messageId == messageId) { // match found

                currentPage ? embed.currentPage = currentPage : []
                pageCount ? embed.pageCount = pageCount : []
                trackCount ? embed.trackCount = trackCount : []
                
                embed.lastUsed = timestamp
                
                return true;

            } else {
                
                continue;
            
            }

        }

    }
    getQueueEmbed(guildId: string, messageId: string) {
        const queue = this.queueMap.get(guildId)
            if (!queue) return false;
        
        let embedObj: activeEmbed
        for (const embed of queue.activeEmbeds) {
            if (embed.messageId == messageId) return embedObj = embed;
        }

        return embedObj ? embedObj : false
    }
    renewQueueEmbed(guildId: string, messageId: string) {
        const queue = this.queueMap.get(guildId)
            if (!queue) return false;
        
        const timestamp = Math.floor(Date.now() / 1000)

        for (const [index, embedObj] of Array.from(queue.activeEmbeds.entries())) {
            
            if (embedObj.messageId == messageId) {
                queue.activeEmbeds[index].lastUsed = timestamp
            }

        }
        
        this.queueMap.set(guildId, queue)

        return true;
    }

    async skip(guildId: Snowflake, index: number): Promise<TrackEntry | false | "last"> {
        const guildQueue = this.queueMap.get(guildId)
        if (guildQueue) {
            if (await stateManager.can.play(guildQueue)) {

                const queue = guildQueue.queue
                if (guildQueue.currentTrack == queue.length - 1) { // Skip the last track in the queue
                    guildQueue.player.stop();
                    return "last";
                } else {
                    return this.goto(guildId, index, true, true);
                }

            }
        }
    }

    async goto(guildId: Snowflake, index: number, ignoreShuffle?: boolean, noChannelUpdate?: boolean): Promise<TrackEntry | false> {
        const guildQueue = this.queueMap.get(guildId)
        if (guildQueue) {
            if (await stateManager.can.play(guildQueue)) {

                const queue = guildQueue.queue
                if (queue[index]) {

                    if (!ignoreShuffle && guildQueue.settings.shuffle) { // Make sure tracks already played in a shuffle don't repeat
                        const requestedTrack = guildQueue.queue[index]
                        if (requestedTrack.shufflePlayed) return false;
                    }

                    const trackLoad = await this.loadTrack(guildId, index);
                    if (trackLoad) {
                        mapMutator.changeCurrentTrack(this.queueMap, guildId, index);

                        if (guildQueue.settings.shuffle) { // Make sure this track doesn't play again when the bot is shuffling
                            mapMutator.setTrackShuffleState(this.queueMap, guildId, index, true);
                        }

                        const songUpdateChannel = await this.client.channels.fetch(guildQueue.songUpdateChannel).catch((err) => {console.warn(err)}) as TextChannel
                        if (songUpdateChannel && !noChannelUpdate) await songUpdateChannel.send({ embeds: [ basicEmbed(`🔊｜Now playing: [${trackLoad.title}](${trackLoad.source}) by ${"`"}${trackLoad.author}${"`"}`, colorPalette.trackOperation) ] }).catch((err) => {console.warn(err)});
                        
                    }



                    return trackLoad
                    
                } else {

                    return false;

                }

            }
        }
    }

    async loadTrack(guildId: Snowflake, position: number, time?: number): Promise<TrackEntry | false> {
        const guildQueue = this.queueMap.get(guildId)
        if (guildQueue) {
            if (stateManager.can.add(guildQueue)) {

                let passedTime = 0
                if (time) {
                    passedTime = time
                }
                
                const resource = await createResource(guildQueue.queue[position], time).catch((err) => {
                    return false;
                }) as AudioResource // Load the resource
                    if (!resource) return false;
                guildQueue.player.play(resource) // Play the resource being loaded

                const connection = getVoiceConnection(guildId)
                if (connection) {
                    connection.subscribe(guildQueue.player)
                }

                mapMutator.changeCurrentTrack(this.queueMap, guildId, position) // Mutate the map (currentTrack)
                mapMutator.changeCurrentResource(this.queueMap, guildId, resource, passedTime) // Mutate the map (currentResource)

                return guildQueue.queue[position];

            }
        }
    }

}
