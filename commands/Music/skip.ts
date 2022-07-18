import RFCommand from "../commandClass";
import { Client, CommandInteraction } from "discord.js";
import { config } from "../../modules/config";
import Queue, { queueMapType } from "../../musicHandler/queue";
import { basicEmbed, colorPalette } from "../../modules/responses";

export default class SkipCommand extends RFCommand {
    constructor(client: Client) {
        super(client)
    }

    slashInfo = {
        name: 'skip',
        description: "Skip the current track.",
    }

    async callback(interaction: CommandInteraction, config: config, queueMap: queueMapType) {
        return new Promise(async (res, rej) => {

            const guild = interaction.guild
            const guildQueue = queueMap.get(guild.id)
                if (!guildQueue) return await interaction.editReply("Could not skip the track.").catch(err => {})
            
            const result = await new Queue(interaction.client, queueMap).goto(guild.id, guildQueue.currentTrack + 1)

            if (result) {
                return interaction.editReply({ embeds: [ basicEmbed( `🔊｜Now playing: [${result.title}](${result.source}) by ${"`"}${result.author}${"`"}`, colorPalette.trackOperation ) ] })
            } else {
                return interaction.editReply({ embeds: [ basicEmbed( `🛑｜There was an error skipping the track.`, colorPalette.error ) ] })
            }

        })
    }
}
