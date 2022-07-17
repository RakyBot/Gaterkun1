import RFCommand from "../commandClass";
import { Client, CommandInteraction } from "discord.js";
import { config } from "../../modules/config";

export default class Test extends RFCommand {
    constructor(client: Client) {
        super(client)
    }

    slashInfo = {
        name: 'test',
        description: "Test Command",
        options: [
            {
                name: "test_option",
                description: "Testing Inputs",
                type: "INTEGER",
                required: true
            },
        ]
    }

    async callback(interaction: CommandInteraction, config: config) {
        return new Promise(async (res, rej) => {

            const guild = interaction.guild

            interaction.editReply("Test")

        })
    }
}
