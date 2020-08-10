
import { Period } from './period.model';
import { KeyPair } from './key-pair.model';

export class BalanceHistory {

    currentBalance: number;
    name: string;
    periods: Period[];
    status: number;
    primaryClientId: string;
    assetBeginDate: string;
    debtBeginDate: string;
    primaryOwnerId: string;
    periodsAsTimeLine: KeyPair[];
}