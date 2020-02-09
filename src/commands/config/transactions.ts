import Command, { flags } from "@oclif/command";
import { CommandFlags } from "../../types";
import ConfigService from "../../services/config";
import prompts from "prompts";

export class ConfigTransactionsCommand extends Command {
    public static flags: CommandFlags = {
        amount: flags.string({
            description: "The amount used for each transaction",
            default: "0.00000001",
        }),
        fee: flags.string({
            description: "The fee used for each transaction",
            default: "0.0001",
        }),
        minVote: flags.string({
            description: "The minimum vote weight of your voters",
            default: "100",
        }),
        passphrase: flags.string({
            description: "The passphrase of the wallet used to send your message",
        }),
        multiPayment: flags.boolean({
            description: "Use multi payments over regular transfers",
            default: true,
        }),
    };

    public async run(): Promise<any> {
        const response = await prompts(
            Object.keys(ConfigTransactionsCommand.flags).map(
                flagName =>
                    ({
                        type:
                            flagName === "passphrase"
                                ? "password"
                                : ConfigTransactionsCommand.flags[flagName].type === "boolean"
                                ? "toggle"
                                : "text",
                        name: flagName,
                        message: ConfigTransactionsCommand.flags[flagName].description,
                        initial: ConfigService.get(flagName) ?? ConfigTransactionsCommand.flags[flagName].default,
                        active: "yes",
                        inactive: "no",
                    } as prompts.PromptObject<string>),
            ) as Array<prompts.PromptObject<string>>,
        );

        if (Object.keys(response).length !== Object.keys(ConfigTransactionsCommand.flags).length) {
            this.error("Please enter valid values and try again!");
        }

        for (const [key, value] of Object.entries(response)) {
            ConfigService.set(key, value);
        }

        this.log("- Success!");
    }
}
