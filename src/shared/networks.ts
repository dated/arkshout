import { Networks } from "@arkecosystem/crypto";

export const validNetworks: string[] = Object.keys(Networks).filter(
    network => !["unitnet", "testnet"].includes(network),
);

export const isValidNetwork = (network: string) => validNetworks.includes(network);

export const defaultHosts: Record<string, string> = {
    mainnet: "https://explorer.ark.io/api",
    devnet: "https://dexplorer.ark.io/api",
};
