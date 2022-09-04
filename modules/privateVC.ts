import { CategoryChannel, Client, VoiceState, PermissionFlagsBits, VoiceChannel, Guild, ChannelType } from "discord.js";
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

    async createVC(config: config, guild: Guild) { // create function
        return new Promise(async (res, rej) => {
            const newVC = await guild.channels.create({
                name: this.newVoiceState.member.user.username,
                type: ChannelType.GuildVoice,
                permissionOverwrites: [
                    {
                        id: this.newVoiceState.member.id,
                        allow: [ PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles ] // Let the VC owner manage the channel and edit roles for the channel
                    },
                    {
                        id: this.newVoiceState.guild.id,
                        allow: [ PermissionFlagsBits.ViewChannel ] // Let everyone access the channel.
                    }
                ]
            }).catch((err) => { throw err; });
            newVC.setParent(config.vcCategory);

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

                    await this.createVC(config, guild).catch((err) => {});

                }
                
                // Check old channel if it expired
                const oldChannel = this.oldVoiceState.channel as VoiceChannel
                if (oldChannel && oldChannel.id != config.createVC && oldChannel.parentId == config.vcCategory) {
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
