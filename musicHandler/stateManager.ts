// This file is responsible for checking the internal states of the bot,
// which are supposed to prevent logical errors from occuring.

import { AudioPlayerStatus } from "@discordjs/voice";
import { QueueEntry } from "./queue";

export default {
    can: { // Check the Discord.js Player States here, and then return the value (clean code :) )
        async add(guildQueue: QueueEntry) { // If: always
            /*const guild = await guildQueue.client.guilds.fetch(guildQueue.guildId).catch((err) => { throw err; })
            const guildMember = await guild.members.fetch(guildQueue.client.user.id).catch((err) => { throw err; })

            if (guildMember.voice.channelId) {
                return true;
            } else {
                return false;
            }*/
            return true;
        },
        async remove(guildQueue: QueueEntry) { // If: connected
            const guild = await guildQueue.client.guilds.fetch(guildQueue.guildId).catch((err) => { throw err; })
            const guildMember = await guild.members.fetch(guildQueue.client.user.id).catch((err) => { throw err; })

            if (guildMember.voice.channelId) {
                return true;
            } else {
                return false;
            }
        },
        async play(guildQueue: QueueEntry) { // If: Connected //, not playing
            const guild = await guildQueue.client.guilds.fetch(guildQueue.guildId).catch((err) => { throw err; })
            const clientMember = await guild.members.fetch(guildQueue.client.user.id).catch((err) => { throw err; })

            if (clientMember.voice.channelId) { // connected to a valid channel
                return true;
                /*if (guildQueue.player.state.status != AudioPlayerStatus.Playing) { // not playing

                    return true;

                }*/

            }

            return false;
        },
        async resume(guildQueue: QueueEntry) { // If: connected, manually paused
            const guild = await guildQueue.client.guilds.fetch(guildQueue.guildId).catch((err) => { throw err; })
            const clientMember = await guild.members.fetch(guildQueue.client.user.id).catch((err) => { throw err; })

            if (clientMember.voice.channelId) { // connected to a valid channel

                if (guildQueue.player.state.status == AudioPlayerStatus.Paused) { // paused

                    return true;

                }

            }

            return false;

        },
        async pause(guildQueue: QueueEntry) { // If: connected, playing
            const guild = await guildQueue.client.guilds.fetch(guildQueue.guildId).catch((err) => { throw err; })
            const clientMember = await guild.members.fetch(guildQueue.client.user.id).catch((err) => { throw err; })

            if (clientMember.voice.channelId) { // connected to a valid channel

                if (guildQueue.player.state.status == AudioPlayerStatus.Playing) { // playing

                    return true;

                }

            }

            return false;

        },
        async move(guildQueue: QueueEntry) { // If: connected
            const guild = await guildQueue.client.guilds.fetch(guildQueue.guildId).catch((err) => { throw err; })
            const clientMember = await guild.members.fetch(guildQueue.client.user.id).catch((err) => { throw err; })

            if (clientMember.voice.channelId) { // connected to a valid channel

                return true;

            }

            return false;
        },
    },
}
