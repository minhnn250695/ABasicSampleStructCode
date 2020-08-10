import { ThirdPartySettings } from './third-party-settings.model';
import { ThirdPartyMode } from './third-party-mode.enum';

interface DictionaryItem<K, V> {
    0: K,
    1: V
};

export class ThirdPartySimpleSettings extends ThirdPartySettings {
    configuration: DictionaryItem<string, string>[];
}