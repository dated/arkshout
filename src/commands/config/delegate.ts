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

        let delegate;

        if (flags.username) {
            try {
                delegate = await ApiService.retrieveDelegate(flags.username as string);
                flags.username = delegate.username;
            } catch (error) {
                this.error("No delegate found with the provided username");
            }
        }

        if (flags.publicKey) {
            if (!this.isValidPublicKey(flags.publicKey as string)) {
                this.error("The provided public key appears to be invalid!");
            }

            try {
                await ApiService.retrieveDelegate(flags.publicKey as string);
            } catch (error) {
                this.error("No delegate found with the provided public key");
            }
        }

        if (flags.username && flags.publicKey) {
            const delegate = await ApiService.retrieveDelegate(flags.username as string);

            if (delegate.publicKey !== flags.publicKey) {
                this.error("The provided username and public key do not match!");
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
                if (!!response.publicKey && !this.isValidPublicKey(response.publicKey)) {
                    this.error("The provided public key appears to be invalid!");
                }

                try {
                    delegate = await ApiService.retrieveDelegate(response.username || response.publicKey);  
                    flags.publicKey = delegate.publicKey;
                } catch (error) {
                    this.error(`No delegate found with the provided ${method}`);
                }
            } else {
                this.error(`Please enter a valid ${method} and try again!`);
            }
        }

        ConfigService.set("delegate", flags.publicKey || delegate.publicKey);

        this.log(
            `- Success! ${Chalk.greenBright(flags.username || delegate.username)} (${Chalk.greenBright(
                flags.publicKey || delegate.publicKey,
            )})`,
        );
    }

    private isValidPublicKey(publicKey: string) {
        return Identities.PublicKey.validate(publicKey);
    }
}
