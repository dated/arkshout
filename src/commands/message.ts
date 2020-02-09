import Command, { flags } from "@oclif/command";
import Chalk from "chalk";
import { Identities, Managers, Utils } from "@arkecosystem/crypto";
import { CommandFlags } from "../types";
import ConfigService from "../services/config";
import { confirm } from "../shared/prompts";
import { capitalize } from "../shared/utils";
import { ConfigFeesCommand } from "./config/fees";
import { ConfigDelegateCommand } from "./config/delegate";
import { ConfigMinVoteCommand } from "./config/minvote";
import { ConfigNetworkCommand } from "./config/network";
import { ConfigPassphraseCommand } from "./config/passphrase";
import ApiService from "../services/api";
import TransactionService from "../services/transaction";
import chunk from "lodash.chunk";
import cli from "cli-ux";
import prompts from "prompts";

export class MessageCommand extends Command {
    static description = "Send a message to your voters";

    public static flags: CommandFlags = {
        vendorField: flags.string({
            description: "The message you want to send to each voter",
        }),
        multi: flags.boolean({
            description: "Use multi payments over regular transfers",
            default: true,
            allowNo: true,
        }),
    };

    public async run(): Promise<void> {
        const { flags } = await this.parse(MessageCommand);

        const config = { ...ConfigService.all(), ...flags };

        for (const setting of ["network", "delegate", "fees", "minVote", "passphrases"]) {
            // @ts-ignore
            if (!config[setting] && !ConfigService.get(setting)) {
                this.warn(`There are no settings for ${Chalk.greenBright(setting)} yet.`);

                // eslint-disable-next-line no-await-in-loop
                await confirm(
                    { message: "Configure now?", initial: true },
                    async () => {
                        switch (setting) {
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
                    },
                    () => {
                        this.error(`You need to configure ${setting} to continue!`);
                    },
                );
            }
        }

        if (!config.vendorField) {
            const response = await prompts([
                {
                    type: "text",
                    name: "vendorField",
                    message: MessageCommand.flags.vendorField.description,
                },
            ]);

            if (response.vendorField === undefined) {
                this.error("Please enter a valid vendor field and try again!");
            }

            config.vendorField = response.vendorField;
        }

        let voters: any[] = [];

        try {
            cli.action.start(`- Retrieving voters with a minimum of ${config.minVote}`);
            voters = await ApiService.retrieveVoters(config.delegate, config.minVote);
        } catch (error) {
            this.error("Failed to retrieve your voters!");
        } finally {
            cli.action.stop(`retrieved ${voters.length} voters`);
        }

        if (voters.length > 0) {
            await confirm(
                { message: `Please confirm you want to send your message to ${voters.length} voters now.` },
                async () => {
                    Managers.configManager.setFromPreset(ConfigService.get("network") as any);

                    const height = (await ApiService.blockchain()).block.height;
                    Managers.configManager.setHeight(height);

                    const sender = Identities.Address.fromPassphrase(config.passphrases.first);

                    const { nonce } = await ApiService.retrieveWallet(sender);
                    config.nonce = Utils.BigNumber.make(nonce);

                    const { multiPaymentLimit } = Managers.configManager.getMilestone(height);

                    const transactions = [];

                    cli.action.start("- Building transactions");
                    for (const recipients of chunk(voters, multiPaymentLimit)) {
                        if (config.multi && recipients.length > 1) {
                            config.nonce = config.nonce.plus(1);
                            transactions.push(TransactionService.buildMultiPayment(recipients, config));
                        } else {
                            for (const recipient of recipients) {
                                config.nonce = config.nonce.plus(1);
                                transactions.push(TransactionService.buildTransfer(recipient, config));
                            }
                        }
                    }
                    cli.action.stop(`built ${transactions.length} transactions`);

                    let count = 0;

                    try {
                        cli.action.start("- Sending transactions");
                        for (const batch of chunk(transactions, 40)) {
                            // eslint-disable-next-line no-await-in-loop
                            await ApiService.postTransactions(batch);
                            count += batch.length;
                        }
                    } catch (error) {
                        const response = JSON.parse(error.message);
                        count += response.data.accept.length;
                        this.error(JSON.stringify(response.errors));
                    } finally {
                        cli.action.stop(`sent ${count} transactions`);
                    }
                },
            );
        }
    }
}
