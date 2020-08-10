import { InsuranceBenefitActionModel } from '../../client-debt/models';

export class InsurancePolicyActionModel {

    actionId: string;
    actionTitle: string;
    personalInsuranceId: string;
    primaryClientId: string;
    clientAssetId: string;
    policyName: string;
    insuranceCompanyId: string;
    premiumsPaidFrom: number;
    premiumFrequency: number;
    benefits: InsuranceBenefitActionModel[] = [];
}