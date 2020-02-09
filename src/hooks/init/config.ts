import { Hook } from "@oclif/config";
import ConfigService from "../../services/config";

// tslint:disable-next-line:only-arrow-functions
export const init: Hook<"init"> = async function({ config }) {
    ConfigService.setup(config);
};
