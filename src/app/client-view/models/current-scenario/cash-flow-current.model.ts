import { CashFlowDetails } from "./cash-flow-details.model";

export class CashFlowCurrent {

    constructor() {
        this.details = new Array<CashFlowDetails>();
    }

    details: CashFlowDetails[];
    onTrack: number;
}