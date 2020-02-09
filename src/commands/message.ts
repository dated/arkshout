import Command, { flags } from "@oclif/command";
import Chalk from "chalk";
import { Identities, Managers, Utils } from "@arkecosystem/crypto";
import { CommandFlags } from "../types";
import ConfigService from "../services/config";
import { confirm } from "../shared/prompts";
import { capitalize } from "../shared/utils";
import { ConfigDelegateCommand } from "./config/delegate";
import { ConfigNetworkCommand } from "./config/network";
import { ConfigTransactionsCommand } from "./config/transactions";
import ApiService from "../services/api";
import TransactionService from "../services/transaction";
import chunk from "lodash.chunk";
import cli from "cli-ux";
import prompts from "prompts";

export class MessageCommand extends Command {
    static description = "Send a message to your voters";

    public static flags: CommandFlags = {
        amount: flags.string({
            description: "The amount used for each transaction",
        }),
        fee: flags.string({
            description: "The fee used for each transaction",
        }),
        minVote: flags.string({
            description: "The minimum vote weight of your voters",
        }),
        passphrase: flags.string({
            description: "The passphrase of the wallet used to send your message",
        }),
        multiPayment: flags.boolean({
            description: "Use multi payments over regular transfers",
        }),
        vendorField: flags.string({
            description: "The message you want to send to each voter",
        }),
    };

    public async run(): Promise<void> {
        const { flags } = await this.parse(MessageCommand);

        const config = ConfigService.all();

        for (const [flag, value] of Object.entries(flags)) {
            config[flag] = value;
        }

        let response;

        for (const setting of ["network", "delegate"]) {
            // @ts-ignore
            if (!config[setting] && !ConfigService[`is${capitalize(setting)}Configured`]()) {
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
                            case "transactions": {
                                await ConfigTransactionsCommand.run([]);
                                break;
                            }
                        }
                    },
                    () => {
                        this.error(`You need to configure the ${setting} to continue!`);
                    },
                );
            }
        }

        if (["amount", "fee", "minVote", "passphrase", "multiPayment"].some(setting => config[setting] === undefined)) {
            this.warn(`Some settings for ${Chalk.greenBright("transactions")} appear to be missing.`);

            await confirm(
                { message: "Configure now?", initial: true },
                async () => {
                    await ConfigTransactionsCommand.run([]);
                },
                () => {
                    this.error("You need to configure the transactions to continue!");
                },
            );
        }

        if (!config.vendorField) {
            response = await prompts([
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
            const minVote = ConfigService.get("minVote");
            cli.action.start(`- Retrieving voters with a minimum of ${minVote} ARK`);
            voters = await ApiService.retrieveVoters(ConfigService.get("delegate"), minVote);
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

                    const sender = Identities.Address.fromPassphrase(config.passphrase);
                    const { nonce } = await ApiService.retrieveWallet(sender);
                    config.nonce = Utils.BigNumber.make(nonce);

                    const { multiPaymentLimit } = Managers.configManager.getMilestone(height);

                    const transactions = [];

                    for (const recipients of chunk(voters, multiPaymentLimit)) {
                        config.nonce = config.nonce.plus(1);

                        if (config.multiPayment && recipients.length > 1) {
                            transactions.push(TransactionService.buildMultiPayment(recipients, config));
                        } else {
                            for (const recipient of recipients) {
                                transactions.push(TransactionService.buildTransfer(recipient, config));
                            }
                        }
                    }

                    console.log(transactions);

                    try {
                        for (const batch of chunk(transactions, 40)) {
                            // eslint-disable-next-line no-await-in-loop
                            await ApiService.postTransactions(batch);
                        }
                    } catch (error) {
                        this.error(error.message);
                    }
                },
            );
        }
    }
}
