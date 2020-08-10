import { PersonalDetail } from './../../common/personal-detail.model';
import { MemberDetail } from './member-detail.model';
import { BeneficiaryDetail } from './beneficiary-detail.model';

export class FundMember {
    beneficiaryDetails: BeneficiaryDetail;
    fundcode: string;
    isMatched: boolean
    membersDetails: MemberDetail;
    personalDetails: PersonalDetail;
    status: string;
}