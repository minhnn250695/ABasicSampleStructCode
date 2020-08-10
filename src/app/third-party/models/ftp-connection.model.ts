import { ThirdPartyConnection } from './third-party-connection.model';

export class FTPConnection extends ThirdPartyConnection  {
    username: string;
    passphrase: string;
    host: string;
    port: number;
    privateKeyFile: string;
    sourceFolder: string;
}