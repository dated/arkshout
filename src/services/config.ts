import { ensureFileSync, readJsonSync, removeSync, writeJsonSync } from "fs-extra";

class ConfigService {
    // @ts-ignore
    private file: string;

    public setup(config: Record<string, any>) {
        this.file = `${config.configDir}/config.json`;
        this.ensureDefaults();
    }

    public all() {
        return this.read();
    }

    public get(key: string): string {
        return this.read()[key];
    }

    public set(key: string, value: string): void {
        this.update({ [key]: value });
    }

    public update(data: Record<string, string>): void {
        this.write({ ...this.read(), ...data });
    }

    public isNetworkConfigured(): boolean {
        return this.get("network") !== undefined;
    }

    public isDelegateConfigured(): boolean {
        return this.get("delegate") !== undefined;
    }

    public isTransactionsConfigured(): boolean {
        return ["amount", "fee", "minVote", "multiPayment", "passphrase"].every(key => {
            return this.get(key) !== undefined;
        });
    }

    private ensureDefaults(): void {
        if (!this.read()) {
            removeSync(this.file);
            ensureFileSync(this.file);
        }
    }

    private read(): any {
        try {
            return readJsonSync(this.file);
        } catch (error) {
            return false;
        }
    }

    private write(data: Record<string, any>): void {
        writeJsonSync(this.file, data);
    }
}

export default new ConfigService();
