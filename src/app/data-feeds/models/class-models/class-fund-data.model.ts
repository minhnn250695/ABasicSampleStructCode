import { ClassCrmAccount } from './class-crm-account.model';
import { Address } from '../common/address.model';
import { Link } from '../common/link.model';
import { FundMember } from './fund-member-models/fund-member.model';

export class ClassFundData {
    abn: string;
    code: string;
    crm: ClassCrmAccount;
    crmId: string;
    entityStatus: string;
    establishmentDeedDate: string;
    fundMembers: FundMember[];
    fundStartDate: string;
    isNonSuper: boolean;
    legalEntityType: number;
    legalEntityTypeString: string;
    links: Link;
    mailingAddress: Address;
    marketTypeItems: any;
    matches: boolean;
    name: string;
    physicalAddress: Address
    tfn: string;
    usePhysicalAddressForMailingAddress: boolean;
}