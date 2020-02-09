import Command from "@oclif/command";
import { ConfigFeesCommand } from "./fees";
import { ConfigDelegateCommand } from "./delegate";
import { ConfigMinVoteCommand } from "./minvote";
import { ConfigNetworkCommand } from "./network";
import { ConfigPassphraseCommand } from "./passphrase";
import prompts from "prompts";

export class ConfigCommand extends Command {
    public static description = "Update the configuration";

    public async run(): Promise<void> {
        const response = await prompts([
            {
                type: "select",
                name: "option",
                message: "What would you like to configure?",
                choices: [
                    { title: "Network", value: "network" },
                    { title: "Delegate", value: "delegate" },
                    { title: "Fees", value: "fees" },
                    { title: "Minimum vote", value: "minVote" },
                    { title: "Passphrases", value: "passphrases" },
                ],
            },
        ]);

        switch (response.option) {
            case undefined: {
                this.error("Please enter a valid option and try again!");
                break;
            }
            case "network": {
                await ConfigNetworkCommand.run([]);
                break;
            }
            case "delegate": {
                await ConfigDelegateCommand.run([]);
                break;
            }
            case "fees": {
                await ConfigFeesCommand.run([]);
                break;
            }
            case "minVote": {
                await ConfigMinVoteCommand.run([]);
                break;
            }
            case "passphrases": {
                await ConfigPassphraseCommand.run([]);
                break;
            }
        }
    }
}
