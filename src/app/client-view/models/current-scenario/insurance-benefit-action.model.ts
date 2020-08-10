export class InsuranceBenefitActionModel {
    id: string;
    tempId: number;
    name: string;
    type: number;
    deleted: boolean = false;
    personInsuredId: string;
    benefitAmount: number;
    premium: number;
    premiumType: number;
    waitingPeriod: number;
    benefitPeriod: number;
}