import RFCommand from "../commandClass";
import { Client, CommandInteraction } from "discord.js";
import { config } from "../../modules/config";
import Queue, { queueMapType } from "../../musicHandler/queue";
import { basicEmbed, colorPalette } from "../../modules/responses";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import mapMutator from "../../musicHandler/mapMutator";

export default class LoopCommand extends RFCommand {
    constructor(client: Client) {
        super(client)
    }

    slashInfo = {
        name: 'loop',
        description: "Loop the music bot.",
        options: [
            {
                name: "track",
                description: "Toggle the track loop.",
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
            },
            {
                name: "queue",
                description: "Toggle the queue loop.",
                type: ApplicationCommandOptionTypes.SUB_COMMAND,
            }
        ]
    }

    async callback(interaction: CommandInteraction, config: config, queueMap: queueMapType) {
        return new Promise(async (res, rej) => {

            const guild = interaction.guild
            const subCommand = interaction.options.getSubcommand();
            const guildQueue = queueMap.get(guild.id)
                if (!guildQueue) return await interaction.editReply("Could not loop the queue.")

            if (subCommand == "track") {

                const looped = guildQueue.settings.trackLoop

                if (looped) {

                    mapMutator.setLoop(queueMap, guild.id, "TRACK", false)
                    return res(await interaction.editReply({ embeds: [ basicEmbed( `🟦｜Stopped looping the current track.`, colorPalette.trackOperation ) ] }).catch((err) => { throw err; }));

                } else {

                    mapMutator.setLoop(queueMap, guild.id, "TRACK", true)
                    return res(await interaction.editReply({ embeds: [ basicEmbed( `🔂｜Looping the current track.`, colorPalette.trackOperation ) ] }).catch((err) => { throw err; }));

                }

            } else if (subCommand == "queue") {

                const looped = guildQueue.settings.queueLoop

                if (looped) {

                    mapMutator.setLoop(queueMap, guild.id, "QUEUE", false)
                    return res(await interaction.editReply({ embeds: [ basicEmbed( `🟦｜Stopped looping the queue.`, colorPalette.trackOperation ) ] }).catch((err) => { throw err; }));

                } else {

                    mapMutator.setLoop(queueMap, guild.id, "QUEUE", true)
                    return res(await interaction.editReply({ embeds: [ basicEmbed( `🔁｜Looping the queue.`, colorPalette.trackOperation ) ] }).catch((err) => { throw err; }));

                }

            }

        })
    }
}
