import { BeneficiaryDetail } from './fund-member-models/beneficiary-detail.model';
import { MemberDetail } from './fund-member-models/member-detail.model';
import { PersonalDetail } from './../common/personal-detail.model';
import { ClassCrmMember } from './class-crm-member.model';

export class Member {
    beneficiaryDetails: BeneficiaryDetail;
    fundcode: string;
    isMatched: boolean;
    matchedMemberName: string;
    memberCRM: ClassCrmMember;
    memberCRMId: string;
    membersDetails: MemberDetail;
    personalDetails: PersonalDetail; 
    status: string;
}