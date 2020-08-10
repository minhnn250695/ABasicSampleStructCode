
import { CashFlowCal, HouseHoldCashFlow, HouseHoldResponse, TotalClientAssets, TotalClientDebts } from './';

export class ClientViewState {
    // id of seleted client
    clientId: string;
    // house hold info of selected client
    houseHolds: HouseHoldResponse;

    totalClientAssets: TotalClientAssets;
    totalClientDebts: TotalClientDebts;
    cashFlowCal: CashFlowCal;
    houseHoldResponse: HouseHoldResponse;
    houseHoldCashFlow: HouseHoldCashFlow;

}