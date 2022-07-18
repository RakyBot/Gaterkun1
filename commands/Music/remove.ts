import RFCommand from "../commandClass";
import { Client, CommandInteraction } from "discord.js";
import { config } from "../../modules/config";
import Queue, { queueMapType } from "../../musicHandler/queue";

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
            const result = await new Queue(interaction.client, queueMap).remove(interaction.guildId, position)

            return await interaction.editReply(result ? "Removed track." : "Could not remove track.").catch(err => {})

        })
    }
}
