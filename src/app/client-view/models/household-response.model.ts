
import { Contact } from './contact.model';

export class HouseHoldResponse {
    id: string;
    name: string;
    primaryClientId: string;
    spouseClientId: string;
    members: Contact[];
    retirementYear: number;
    retirementIncome: number;
    factFind: boolean;
    jointSalutation: string;
    clientOnboardingStep: number;
}