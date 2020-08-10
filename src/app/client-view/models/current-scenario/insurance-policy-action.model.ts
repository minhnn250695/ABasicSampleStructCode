import { InsuranceBenefitActionModel, OwnershipType } from '../../client-debt/models';
export class InsurancePolicyActionModel {

    actionId: string;
    actionTitle: string;
    personalInsuranceId: string;
    primaryClientId: string;
    ownerId:string;
    ownershipType: number = OwnershipType.ASSET; // we always need to care about which Asset for this insurance policy
    clientAssetId: string;
    policyName: string;
    insuranceCompanyId: string;
    premiumsPaidFrom: number;
    premiumFrequency: number;
    benefits: InsuranceBenefitActionModel[] = [];
    details: string;
    reason: string;
    result: string;
}