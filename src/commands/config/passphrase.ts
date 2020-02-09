import Command, { flags } from "@oclif/command";
import { CommandFlags } from "../../types";
import ConfigService from "../../services/config";
import Chalk from "chalk";
import prompts from "prompts";

export class ConfigPassphraseCommand extends Command {
    public static description = "Configure the passphrase(s) used to send your transactions";

    public static examples: string[] = [
        `Configure the first passphrase
$ arkshout config:passphrase --first=my first passphrase
`,
        `Configure the second passphrase
$ arkshout config:passphrase --second=my second passphrase
`,
    ];

    public static flags: CommandFlags = {
        first: flags.string({
            description: "Your passphrase",
        }),
        second: flags.string({
            description: "Your second passphrase",
        }),
    };

    public async run(): Promise<void> {
        const { flags } = await this.parse(ConfigPassphraseCommand);

        for (const passphrase of Object.keys(ConfigPassphraseCommand.flags)) {
            if (flags[passphrase]) {
                ConfigService.set("passphrases", {
                    ...ConfigService.passphrases,
                    [passphrase]: flags[passphrase],
                });
            } else {
                // eslint-disable-next-line no-await-in-loop
                const response = await prompts([
                    {
                        type: "password",
                        name: passphrase,
                        message: ConfigPassphraseCommand.flags[passphrase].description,
                        initial: ConfigService.get("passphrases")?.[passphrase],
                    },
                ]);

                flags[passphrase] = response[passphrase];

                if (flags[passphrase] === undefined) {
                    this.error("Please enter a valid value and try again!");
                } else {
                    ConfigService.set("passphrases", {
                        ...ConfigService.get("passphrases"),
                        [passphrase]: flags[passphrase],
                    });
                }
            }
        }

        this.log("- Success!");
    }
}
