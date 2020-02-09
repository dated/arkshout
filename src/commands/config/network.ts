import Command, { flags } from "@oclif/command";
import ConfigService from "../../services/config";
import { defaultHosts, validNetworks, isValidNetwork } from "../../shared/networks";
import { capitalize } from "../../shared/utils";
import Chalk from "chalk";
import prompts from "prompts";

export class ConfigNetworkCommand extends Command {
    public static flags = {
        network: flags.string({
            description: "The name of the network that should be used",
            options: validNetworks,
        }),
        host: flags.string({
            description: "The host used to interact with the blockchain",
        }),
    };

    public async run(): Promise<any> {
        const { flags } = this.parse(ConfigNetworkCommand);

        let response;

        if (!flags.network) {
            response = await prompts([
                {
                    type: "select",
                    name: "network",
                    message: "What network do you want to operate on?",
                    choices: validNetworks.map(network => ({
                        title: capitalize(network),
                        value: network,
                    })),
                },
            ]);

            if (response.network) {
                flags.network = response.network;
            } else {
                this.error("Please enter valid network and try again!");
            }
        }

        if (!isValidNetwork(flags.network as string)) {
            this.error(`Please enter valid network (${validNetworks.join(", ")}) and try again!`);
        }

        if (!flags.host) {
            response = await prompts([
                {
                    type: "text",
                    name: "host",
                    message: "Type in the peer address you want to interact with",
                    initial: ConfigService.get("host") || defaultHosts[flags.network as string],
                },
            ]);

            if (response.host) {
                flags.host = response.host;
            } else {
                this.error("Please enter valid host and try again!");
            }
        }

        ConfigService.set("network", flags.network as string);
        ConfigService.set("host", flags.host as string);

        this.log(`- Success! ${Chalk.greenBright(capitalize(flags.network as string))} - ${flags.host}`);
    }
}
