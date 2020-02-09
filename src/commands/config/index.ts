import Command from "@oclif/command";
import { ConfigDelegateCommand } from "./delegate";
import { ConfigNetworkCommand } from "./network";
import { ConfigTransactionsCommand } from "./transactions";
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
                    { title: "Transactions", value: "transactions" },
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
            case "transactions": {
                await ConfigTransactionsCommand.run([]);
                break;
            }
        }
    }
}
