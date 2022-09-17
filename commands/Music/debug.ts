import RFCommand from "../commandClass";
import { Client, ChatInputCommandInteraction } from "discord.js";
import { config } from "../../modules/config";
import Queue, { queueMapType } from "../../musicHandler/queue";

export default class DebugCommand extends RFCommand {
    constructor(client: Client) {
        super(client)
    }

    slashInfo = {
        name: 'debug',
        description: "Debugger for the music function. (Only use this if you know what you're doing)",
    }

    async callback(interaction: ChatInputCommandInteraction, config: config, queueMap: queueMapType) {
        return new Promise(async (res, rej) => {

            const guild = interaction.guild
            const guildQueue = queueMap.get(guild.id)
                if (!guildQueue) return;

            return interaction.editReply({ embeds: [{

                title: 'Debug',
                fields: [
                    {
                        name: "Guild Queue Payload",
                        value: "```" + JSON.stringify({
                            guildId: guildQueue.guildId,
                            currentTrack: guildQueue.currentTrack,
                            activeEmbeds: guildQueue.activeEmbeds,
                            songUpdateChannel: guildQueue.songUpdateChannel,
                            settings: guildQueue.settings
                        }) + "```",
                    }
                ]

            }] })

        })
    }
}
