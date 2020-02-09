import Command, { flags } from "@oclif/command";
import { Identities } from "@arkecosystem/crypto";
import { CommandFlags } from "../../types";
import ConfigService from "../../services/config";
import ApiService from "../../services/api";
import Chalk from "chalk";
import prompts from "prompts";

export class ConfigFeesCommand extends Command {
    public static description = "Configure the fees used for your transactions";

    public static examples: string[] = [
        `Configure the fee used for regular transfer
$ arkshout config:fees --transfer=0.0001
`,
        `Configure the fee used for multi payments
$ arkshout config:fees --transfer=0.01
`,
    ];

    public static flags: CommandFlags = {
        transfer: flags.string({
            description: "The fee used for regular transfers",
        }),
        multiPayment: flags.string({
            description: "The fee used for multi payments",
        }),
    };

    public async run(): Promise<void> {
        const { flags } = await this.parse(ConfigFeesCommand);

        for (const setting of Object.keys(ConfigFeesCommand.flags)) {
            if (flags[setting]) {
                ConfigService.set("fees", {
                    ...ConfigService.get("fees"),
                    [setting]: flags[setting],
                });
            } else {
                // eslint-disable-next-line no-await-in-loop
                const response = await prompts([
                    {
                        type: "text",
                        name: setting,
                        message: ConfigFeesCommand.flags[setting].description,
                        initial: ConfigService.get("fees")?.[setting] || setting === "transfer" ? "0.005" : "0.01",
                    },
                ]);

                flags[setting] = response[setting];

                if (flags[setting] === undefined) {
                    this.error("Please enter a valid value and try again!");
                } else {
                    ConfigService.set("fees", {
                        ...ConfigService.get("fees"),
                        [setting]: flags[setting],
                    });
                }
            }
        }

        this.log(
            `- Success! Transfer fee: ${Chalk.greenBright(flags.transfer)} / Multi Payment fee: ${Chalk.greenBright(
                flags.multiPayment,
            )}`,
        );
    }
}
