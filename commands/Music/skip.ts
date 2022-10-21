import RFCommand from "../commandClass";
import { Client, ChatInputCommandInteraction } from "discord.js";
import { config } from "../../modules/config";
import Queue, { queueMapType } from "../../musicHandler/queue";
import { basicEmbed, colorPalette } from "../../modules/responses";

export default class SkipCommand extends RFCommand {
    constructor(client: Client) {
        super(client)
    }

    slashInfo = {
        name: 'skip',
        description: "🎧 Salta la cancion actual.",
    }

    async callback(interaction: ChatInputCommandInteraction, config: config, queueMap: queueMapType) {
        return new Promise(async (res, rej) => {

            const guild = interaction.guild
            const guildQueue = queueMap.get(guild.id)
                if (!guildQueue) return await interaction.editReply("<:axdd:1013162318764449883> Hubo un error al saltar la cancion.").catch(err => {})
            
            const result = await new Queue(interaction.client, queueMap).skip(guild.id, guildQueue.currentTrack + 1)

            if (result == "last") {
                return interaction.editReply({ embeds: [ basicEmbed( `<:xdd:1013896171409907783> Se saltó la cancion actual.`, colorPalette.trackOperation ) ] })
            } else if (result) {
                return interaction.editReply({ embeds: [ basicEmbed( `<:xdda:1013161845873442877> Poniendo ahora: [${result.title}](${result.source}) por ${"`"}${result.author}${"`"}`, colorPalette.trackOperation ) ] })
            } else {
                return interaction.editReply({ embeds: [ basicEmbed( `<:xdda:1013162318764449883> Hubo un error al saltar la cancion.`, colorPalette.error ) ] })
            }

        })
    }
}
