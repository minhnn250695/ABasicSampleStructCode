import { PersonalDetail } from '../common/personal-detail.model';
import { InsuranceBenefits } from './benefits.model';

export class Insurance {
    providerName: string;
    entityName: string;
    productProvider: string;
    policyType: string;
    policyNumber: number;
    policyStatus: string;
    policyOwner: PersonalDetail;
    issueDate: string;
    insuranceBenefits: InsuranceBenefits[];
    matches: boolean;
    externalId: string;
    crmId: string;
    id: string;
    primaryClient: string;
    primaryClientId: string;
    benefits: InsuranceBenefits[];
    premiumFrequency: string;
}