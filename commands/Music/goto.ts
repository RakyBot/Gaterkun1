import RFCommand from "../commandClass";
import { Client, CommandInteraction, GuildMember } from "discord.js";
import { joinVoiceChannel } from "@discordjs/voice";
import { config } from "../../modules/config";
import Queue, { queueMapType } from "../../musicHandler/queue";
import { basicEmbed, colorPalette } from "../../modules/responses";

export default class GotoCommand extends RFCommand {
    constructor(client: Client) {
        super(client)
    }

    slashInfo = {
        name: 'goto',
        description: "Go to a track in the queue.",
        options: [
            {
                name: "position",
                description: "The position in the queue of the track to go to.",
                type: "INTEGER",
                required: true
            },
        ]
    }

    async callback(interaction: CommandInteraction, config: config, queueMap: queueMapType) {
        return new Promise(async (res, rej) => {

            const guild = interaction.guild
            const position = interaction.options.getInteger('position') - 1
            
            const result = await new Queue(interaction.client, queueMap).goto(guild.id, position)

            if (result) {
                return interaction.editReply({ embeds: [ basicEmbed( `⏭️｜Went to track ${"`"}${position + 1}${"`"}.\n🔊｜Now playing: [${result.title}](${result.source}) by ${"`"}${result.author}${"`"}.`, colorPalette.trackOperation ) ] })
            } else {
                return interaction.editReply({ embeds: [ basicEmbed( `🛑｜Unable to go to that track.`, colorPalette.error ) ] })
            }
            

        })
    }
}
