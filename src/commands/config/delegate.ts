import Command, { flags } from "@oclif/command";
import { Identities } from "@arkecosystem/crypto";
import { CommandFlags } from "../../types";
import ConfigService from "../../services/config";
import ApiService from "../../services/api";
import Chalk from "chalk";
import prompts from "prompts";

export class ConfigDelegateCommand extends Command {
    public static description = "Configure the delegate";

    public static examples: string[] = [
        `Configure the delegate using their username
$ arkshout config:delegate --username=dated
`,
        `Configure the delegate using their public key
$ arkshout config:delegate --publicKey=02cb93172a19a66e...
`,
    ];

    public static flags: CommandFlags = {
        username: flags.string({
            description: "The username of your delegate",
        }),
        publicKey: flags.string({
            description: "The public key of your delegate",
        }),
    };

    public async run(): Promise<void> {
        const { flags } = await this.parse(ConfigDelegateCommand);

        let identifier = "";

        if (flags.username) {
            identifier = flags.username as string;
        }

        if (flags.publicKey) {
            if (!this.isValidPublicKey(flags.publicKey as string)) {
                this.error("The provided public key appears to be invalid!");
            }
            identifier = flags.publicKey as string;
        }

        let wallet = await ApiService.retrieveWallet(identifier);

        if (flags.username && flags.publicKey) {
            if (wallet.publicKey !== flags.publicKey) {
                this.error("The provided username and publicKey do not match!");
            }
        }

        let response;

        if (!flags.username && !flags.publicKey) {
            response = await prompts([
                {
                    type: "select",
                    name: "method",
                    message: "How would you like to configure your delegate?",
                    choices: [
                        { title: "Public Key", value: "publicKey" },
                        { title: "Username", value: "username" },
                    ],
                },
            ]);

            if (!response.method) {
                this.error("Please enter a valid method and try again!");
            }

            const method = response.method;

            response = await prompts([
                {
                    type: "text",
                    name: method,
                    message: `Please enter the ${method} of your delegate`,
                },
            ]);

            if (response[method]) {
                wallet = await ApiService.retrieveWallet(response.username || response.publicKey);
                if (response[method] === "publicKey") {
                    if (!this.isValidPublicKey(response.publicKey)) {
                        this.error("The provided public key appears to be invalid!");
                    }
                }
            } else {
                this.error(`Please enter a valid ${method} and try again!`);
            }
        }

        ConfigService.set("delegate", flags.publicKey || wallet.publicKey);
        this.log(
            `- Success! ${Chalk.greenBright(flags.username || wallet.username)} (${Chalk.greenBright(
                flags.publicKey || wallet.publicKey,
            )})`,
        );
    }

    private isValidPublicKey(publicKey: string) {
        return Identities.PublicKey.validate(publicKey);
    }
}
