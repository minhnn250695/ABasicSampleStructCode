import { ThirdPartyConnection } from './third-party-connection.model';

export class SOAPConnection extends ThirdPartyConnection {
    username: string;
    password: string;
    adviserId: string;
    thirdPartyName: string;
    URL:string;
}