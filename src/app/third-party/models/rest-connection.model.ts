import { ThirdPartyConnection } from './third-party-connection.model';

export class RESTConnection extends ThirdPartyConnection {
    username: string;
    password: string;
    url: string;
    referer: string;
}