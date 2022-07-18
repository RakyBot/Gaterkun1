import RFCommand from "../commandClass";
import { Client, CommandInteraction } from "discord.js";
import { config } from "../../modules/config";
import Queue, { queueMapType } from "../../musicHandler/queue";
import { basicEmbed, colorPalette } from "../../modules/responses";

export default class RemoveCommand extends RFCommand {
    constructor(client: Client) {
        super(client)
    }

    slashInfo = {
        name: 'remove',
        description: "Remove a track from the queue.",
        options: [
            {
                name: "position",
                description: "The position in the queue of the track to remove",
                type: "INTEGER",
                required: true
            }
        ],
    }

    async callback(interaction: CommandInteraction, config: config, queueMap: queueMapType) {
        return new Promise(async (res, rej) => {

            const guild = interaction.guild
            const position = interaction.options.getInteger('position', true) - 1
            const guildQueue = queueMap.get(guild.id)
                if (!guildQueue) return interaction.editReply("Could not remove the track.")
            const result = await new Queue(interaction.client, queueMap).remove(interaction.guildId, position)

            if (result) {
                return interaction.editReply({ embeds: [ basicEmbed( `🗑️｜Removed [${result.title}](${result.source}) by ${"`"}${result.author}${"`"}`, colorPalette.trackOperation ) ] })
            } else {
                return interaction.editReply({ embeds: [ basicEmbed( `🛑｜There is no track at ${"`"}${position + 1}${"`"}. Please select a number ${"`"}1${"`"} - ${"`"}${guildQueue.queue.length}${"`"}.`, colorPalette.error ) ] })
            }
            return await interaction.editReply(result ? "Removed track." : "Could not remove track.").catch(err => {})

        })
    }
}
