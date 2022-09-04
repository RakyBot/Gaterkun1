import RFCommand from "../commandClass";
import { ApplicationCommandOptionType, Client, ChatInputCommandInteraction } from "discord.js";
import { config } from "../../modules/config";
import Queue, { queueMapType } from "../../musicHandler/queue";
import { basicEmbed, colorPalette } from "../../modules/responses";

export default class MoveCommand extends RFCommand {
    constructor(client: Client) {
        super(client)
    }

    slashInfo = {
        name: 'move',
        description: "Move a track from one position in the queue to another.",
        options: [
            {
                name: "track",
                description: "The position in the queue of the track to move.",
                type: ApplicationCommandOptionType.Integer,
                required: true
            },
            {
                name: "new_position",
                description: "The new position in the queue to move the track to.",
                type: ApplicationCommandOptionType.Integer,
                required: true
            },
        ]
    }

    async callback(interaction: ChatInputCommandInteraction, config: config, queueMap: queueMapType) {
        return new Promise(async (res, rej) => {

            const guild = interaction.guild
            const oldIndex = interaction.options.getInteger('track', true) - 1 // 0-Based Index
            const newIndex = interaction.options.getInteger('new_position', true) - 1 // 0-Based Index

            const result = await new Queue(interaction.client, queueMap).move(guild.id, oldIndex, newIndex)

            if (result) {
                return interaction.editReply({ embeds: [ basicEmbed( `🛒｜Moved [${result.title}](${result.source}) by ${"`"}${result.author}${"`"} to position ${"`"}${newIndex + 1}${"`"}.`, colorPalette.success ) ] })
            } else {
                return interaction.editReply({ embeds: [ basicEmbed( `🛑｜Could not move the requested track to position ${newIndex + 1}.`, colorPalette.error ) ] })
            }

        })
    }
}
