import { ConfigType } from './config-type.enum';
import { ThirdPartyType } from './third-party-type.enum';

export class ThirdPartyInfo {
    name: string;
    enabled: boolean;
    type: ThirdPartyType;
    connectionType: ConfigType;
    connectionStatus: boolean;
}