import { AudioPlayer, AudioResource } from "@discordjs/voice";
import { Snowflake } from "discord.js";
import { queueMapType, TrackEntry } from "./queue";

const defaultQueueSettings = {
    queueLoop: false,
    trackLoop: false,
    shuffle: false,
}

export default { // NOTE: This module expects zero-based indexes

    insertTrack(queueMap: queueMapType, guildId: Snowflake, track: TrackEntry, index?: number) { // If an index is not specified, track is added to the end.
        const guildQueue = queueMap.get(guildId)
            if (!guildQueue) return false;
        
        guildQueue.queue.splice(index ? index : guildQueue.queue.length, 0, track) // logic for the above comment

        queueMap.set(guildId, guildQueue)
        return true;
    },

    deleteTrack(queueMap: queueMapType, guildId: Snowflake, index: number) {
        const guildQueue = queueMap.get(guildId)
            if (!guildQueue) return false;
        
        guildQueue.queue.splice(index, 1)

        queueMap.set(guildId, guildQueue)
        return true;
    },

    moveTrack(queueMap: queueMapType, guildId: Snowflake, oldIndex: number, newIndex: number) {
        const guildQueue = queueMap.get(guildId)
            if (!guildQueue) return false;
        
        const entry = guildQueue.queue[oldIndex] // Reference the track being moved
            guildQueue.queue.splice(oldIndex, 1) /// This might cause a logic issue?
        
        guildQueue.queue.splice(newIndex, 0, entry) // Insert the track being moved to its new location in the queue
        
        queueMap.set(guildId, guildQueue)
        return true;
    },

    changeCurrentTrack(queueMap: queueMapType, guildId: Snowflake, newCurrentTrack: number) {
        const guildQueue = queueMap.get(guildId)
            if (!guildQueue) return false;
        
        guildQueue.currentTrack = newCurrentTrack

        queueMap.set(guildId, guildQueue)
        return true;
    },

    changeCurrentResource(queueMap: queueMapType, guildId: Snowflake, newResource: AudioResource, passedTime?: number) {
        const guildQueue = queueMap.get(guildId)
            if (!guildQueue) return false;
    
        guildQueue.currentResource = {
            resource: newResource,
            savedPassedTime: passedTime ? passedTime : 0,
        }

        queueMap.set(guildId, guildQueue)
        return true;
    },

    setLoop(queueMap: queueMapType, guildId: Snowflake, loopType: "QUEUE" | "TRACK", state: boolean) {
        const guildQueue = queueMap.get(guildId)
            if (!guildQueue) return false;
        
        if (loopType == "QUEUE") {

            guildQueue.settings = defaultQueueSettings
            guildQueue.settings.queueLoop = state

        } else if (loopType == "TRACK") {

            guildQueue.settings = defaultQueueSettings
            guildQueue.settings.trackLoop = state

        }

        queueMap.set(guildId, guildQueue)
        return true;
        
    },

    setShuffle(queueMap: queueMapType, guildId: Snowflake, state: boolean) {

        const guildQueue = queueMap.get(guildId)
            if (!guildQueue) return false;
        
        guildQueue.settings = defaultQueueSettings
        guildQueue.settings.shuffle = state

        queueMap.set(guildId, guildQueue)
        return true;
        
    },

    setTrackShuffleState(queueMap: queueMapType, guildId: Snowflake, trackIndex: number, state: boolean) {

        const guildQueue = queueMap.get(guildId)
            if (!guildQueue) return false;
    
        guildQueue.queue[trackIndex].shufflePlayed = state
        
        queueMap.set(guildId, guildQueue)
        return true;

    },

    setSongUpdateChannel(queueMap: queueMapType, guildId: Snowflake, channelId: Snowflake) {

        const guildQueue = queueMap.get(guildId)
            if (!guildQueue) return false;
    
        guildQueue.songUpdateChannel = channelId;
        
        queueMap.set(guildId, guildQueue)
        return true;

    },

    setPlayer(queueMap: queueMapType, guildId: Snowflake, player: AudioPlayer) {

        const guildQueue = queueMap.get(guildId)
            if (!guildQueue) return false;

        guildQueue.player = player;
        
        queueMap.set(guildId, guildQueue)
        return true;

    },
    
}
