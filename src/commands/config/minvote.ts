import Command, { args } from "@oclif/command";
import ConfigService from "../../services/config";
import Chalk from "chalk";
import prompts from "prompts";

export class ConfigMinVoteCommand extends Command {
    public static description = "Configure the minimum vote weight used to filter your voters";

    public static examples: string[] = [
        `Configure the minimum vote weight
$ arkshout config:minvote 1000
`,
    ];

    public static args = [
        {
            name: "minVote",
            description: "The minimum vote weight used to filter your voters",
        },
    ];

    public async run(): Promise<void> {
        const { args } = await this.parse(ConfigMinVoteCommand);

        if (args.minVote) {
            ConfigService.set("minVote", args.minVote);
        } else {
            const response = await prompts([
                {
                    type: "text",
                    name: "minVote",
                    message: "Please enter the minimum vote weight used to filter your voters",
                    initial: ConfigService.minVote || 100,
                },
            ]);

            args.minVote = response.minVote;

            if (args.minVote === undefined) {
                this.error("Please enter a valid value and try again!");
            } else {
                ConfigService.set("minVote", args.minVote);
            }
        }

        this.log(`- Success! Minimum vote: ${Chalk.greenBright(args.minVote)}`);
    }
}
