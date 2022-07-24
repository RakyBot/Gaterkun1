import { CategoryChannel, Client, VoiceState, Permissions, VoiceChannel } from "discord.js";
import Config, { config } from "./config";

export default class PrivateVC {
    client: Client
    oldVoiceState: VoiceState
    newVoiceState: VoiceState

    constructor(client: Client, oldVoiceState: VoiceState, newVoiceState: VoiceState) {
        this.client = client
        this.oldVoiceState = oldVoiceState
        this.newVoiceState = newVoiceState
    }

    async createVC(config: config) { // create function
        return new Promise(async (res, rej) => {
            const createCategory = await this.client.channels.fetch(config.vcCategory) as CategoryChannel;
            const newVC = await createCategory.createChannel(this.newVoiceState.member.user.username, {
                type: "GUILD_VOICE",
                permissionOverwrites: [
                    {
                        id: this.newVoiceState.member.id,
                        allow: [ Permissions.FLAGS.MANAGE_CHANNELS, Permissions.FLAGS.MANAGE_ROLES ] // Let the VC owner manage the channel and edit roles for the channel
                    }
                ]
            }).catch((err) => { throw err; });

            await this.newVoiceState.setChannel(newVC).catch((err) => { return; });
            return res(newVC);
        })
    }

    async update() { // check function
        return new Promise(async (res, rej) => {
            const guild = this.newVoiceState.guild
            const config = await new Config(guild.id).get().catch((err) => { throw err; }) as config

            if (config && config.privateVC) {
                if (this.newVoiceState.channelId == config.createVC) { // Joined VC Create Channel

                    await this.createVC(config).catch((err) => {});

                }
                
                // Check old channel if it expired
                const oldChannel = this.oldVoiceState.channel as VoiceChannel
                if (oldChannel && oldChannel.id != config.createVC) {
                    const connectedMembers = Array.from(oldChannel.members.entries())
                    if (connectedMembers.length <= 0) {
                        oldChannel.delete("VC Expired.").catch((err) => {})
                    }
                }
                
                return res(true);

            } else { // Config not found, server not setup.
                
                return rej(false);
            
            }
        })
    }
}
