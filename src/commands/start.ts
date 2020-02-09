import Command from "@oclif/command";
import { ConfigCommand } from "./config";
import { MessageCommand } from "./message";
import prompts from "prompts";

export class StartCommand extends Command {
    public static description = "Start the CLI";

    public async run(): Promise<void> {
        const response = await prompts([
            {
                type: "select",
                name: "option",
                message: "Welcome to ARK Shout! What would you like to do?",
                choices: [
                    { title: "Message", value: "message" },
                    { title: "Settings", value: "config" },
                    { title: "Exit", value: "exit" },
                ],
            },
        ]);

        switch (response.option) {
            case undefined: {
                this.error("Please enter valid option and try again!");
                break;
            }
            case "exit": {
                this.log("- Bye!");
                this.exit();
                break;
            }
            case "config": {
                await ConfigCommand.run([]);
                break;
            }
            case "message": {
                await MessageCommand.run([]);
                break;
            }
            default:
                break;
        }

        await this.run();
    }
}
