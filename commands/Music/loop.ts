import RFCommand from "../commandClass";
import { ChatInputCommandInteraction, Client } from "discord.js";
import { config } from "../../modules/config";
import { queueMapType } from "../../musicHandler/queue";
import { basicEmbed, colorPalette } from "../../modules/responses";
import { ApplicationCommandOptionType } from "discord.js";
import mapMutator from "../../musicHandler/mapMutator";

export default class LoopCommand extends RFCommand {
    constructor(client: Client) {
        super(client)
    }

    slashInfo = {
        name: 'loop',
        description: "📚 Bucle el bot de música.",
        options: [
            {
                name: "track",
                description: "Alternar el bucle de pista.",
                type: ApplicationCommandOptionType.Subcommand,
            },
            {
                name: "queue",
                description: "Alternar el bucle de cola.",
                type: ApplicationCommandOptionType.Subcommand,
            }
        ]
    }

    async callback(interaction: ChatInputCommandInteraction, config: config, queueMap: queueMapType) {
        return new Promise(async (res, rej) => {

            const guild = interaction.guild
            const subCommand = interaction.options.getSubcommand()
            const guildQueue = queueMap.get(guild.id)
                if (!guildQueue) return await interaction.editReply("Could not loop the queue.")

            if (subCommand == 'track') {

                const looped = guildQueue.settings.trackLoop

                if (looped) {

                    mapMutator.setLoop(queueMap, guild.id, "TRACK", false)
                    return res(await interaction.editReply({ embeds: [ basicEmbed( `<:xdda:1013164139625062512> Se detuvo el bucle de la pista actual.`, colorPalette.trackOperation ) ] }).catch((err) => { throw err; }));

                } else {

                    mapMutator.setLoop(queueMap, guild.id, "TRACK", true)
                    return res(await interaction.editReply({ embeds: [ basicEmbed( `<:xdda:1013896171409907783> Bucle de la pista actual.`, colorPalette.trackOperation ) ] }).catch((err) => { throw err; }));

                }

            } else if (subCommand == 'queue') {

                const looped = guildQueue.settings.queueLoop

                if (looped) {

                    mapMutator.setLoop(queueMap, guild.id, "QUEUE", false)
                    return res(await interaction.editReply({ embeds: [ basicEmbed( `<:xdda:1013164139625062512> Dejó de hacer un bucle en la cola.`, colorPalette.trackOperation ) ] }).catch((err) => { throw err; }));

                } else {

                    mapMutator.setLoop(queueMap, guild.id, "QUEUE", true)
                    return res(await interaction.editReply({ embeds: [ basicEmbed( `<:xdda:1013165735431901276> Reponiendo la cola.`, colorPalette.trackOperation ) ] }).catch((err) => { throw err; }));

                }

            }

        })
    }
}
