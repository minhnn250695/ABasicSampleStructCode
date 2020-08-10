import { ThirdPartySettings } from './third-party-settings.model';
import { ThirdPartyMode } from './third-party-mode.enum';

export class ThirdPartyDataFeedSettings extends ThirdPartySettings {
    mode: ThirdPartyMode;
    downloadedFilesThreshold: number;
    importToCRM: boolean;
    enabled: boolean;
}