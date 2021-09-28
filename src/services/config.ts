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

    public get(key: string): any {
        return this.read()[key];
    }

    public set(key: string, value: any): void {
        this.update({ [key]: value });
    }

    public update(data: Record<string, any>): void {
        this.write({ ...this.read(), ...data });
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
        } catch {
            return false;
        }
    }

    private write(data: Record<string, any>): void {
        writeJsonSync(this.file, data);
    }
}

export default new ConfigService();
