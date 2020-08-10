import { ConfigType } from './config-type.enum';
import { ThirdPartyConnection } from './third-party-connection.model';
import { ThirdPartySettings } from './third-party-settings.model';
import { ThirdPartyType } from './third-party-type.enum';

export class ThirdParty<TSettings extends ThirdPartySettings, TConnection extends ThirdPartyConnection> {
    type: ThirdPartyType;
    connectionType: ConfigType;
    name: string;
    companyId: string;
    settings: TSettings;
    connection: TConnection;
    connectionStatus: boolean;
    constructor() {
        this.settings = {} as TSettings;
        this.connection = {} as TConnection;
    }
}