
import { Address } from './address.model';
import { Phone } from './phone.model';

export class PersonalDetail {
    fullName: string;
    firstName: string;
    lastName: string;
    middleNames: string;
    birthDate: string;
    dateOfbirth: string;
    addresses: Address[];
    phones: Phone[]; 
    preferredName: string;
    preferredSalutation: string;
    title: string;
    matches: boolean;
    externalId: string;
    crmId: string;
}