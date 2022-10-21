import RFCommand from "../commandClass";
import { Client, ChatInputCommandInteraction, Guild } from "discord.js";
import { config } from "../../modules/config";
import Queue, { queueMapType } from "../../musicHandler/queue";
import { basicEmbed, colorPalette } from "../../modules/responses";
import mapMutator from "../../musicHandler/mapMutator";

export default class ShuffleCommand extends RFCommand {
    constructor(client: Client) {
        super(client)
    }

    slashInfo = {
        name: 'shuffle',
        description: "🔊 Baraja la lista de canciones.",
    }

    async callback(interaction: ChatInputCommandInteraction, config: config, queueMap: queueMapType) {
        return new Promise(async (res, rej) => {

            const guild = interaction.guild as Guild
            const guildQueue = queueMap.get(guild.id)
                if (!guildQueue) return;

            const shuffled = guildQueue.settings.shuffle

            if (shuffled) {

                const result = mapMutator.setShuffle(queueMap, guild.id, false);

                for (const [index, track] of guildQueue.queue.entries()) {
                    mapMutator.setTrackShuffleState(queueMap, guild.id, index, false); // reset the shuffle state of all songs.
                }

                return interaction.editReply({ embeds: [ basicEmbed( `<:xdda:1013166313583161351> Dejo de barejar la cola.`, colorPalette.trackOperation ) ] });

            } else {

                const result = mapMutator.setShuffle(queueMap, guild.id, true);
                return interaction.editReply({ embeds: [ basicEmbed( `<:xdda:1013182506461302885> Barejo la lista.`, colorPalette.trackOperation ) ] });

            }

        })
    }
}
