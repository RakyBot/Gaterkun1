import { getVoiceConnection } from "@discordjs/voice";
import { Client, VoiceState } from "discord.js";

export default async function timeout(client: Client, oldState: VoiceState, newState: VoiceState) {

    const guild = oldState.guild
    const voiceChannel = oldState.channel

    if (!voiceChannel) return;

    if (voiceChannel.members.has(client.user.id)) {

        if (Array.from(voiceChannel.members.values()).length <= 1) {

            getVoiceConnection(guild.id).destroy() // Instant Disconnect

        }

    }

}
