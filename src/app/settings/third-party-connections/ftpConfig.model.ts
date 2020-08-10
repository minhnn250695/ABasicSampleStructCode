export class FTPConfig {

    constructor(provider: string) {
        this.provider = provider;
    }

    companyId: string;
    provider: string;
    username: string;
    passphrase: string;
    host: string;
    port: number;
    privateKeyFile: string;
    sourceFolder: string;
}