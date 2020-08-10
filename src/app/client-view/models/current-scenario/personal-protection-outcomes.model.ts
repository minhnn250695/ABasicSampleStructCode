import { PersonalProtectionCoverModel } from './personal-protection-cover.model';
import { PersonalProtectionIncomeAnalysisModel } from './personal-protection-income-analysis.model';

export class PersonalProtectionOutcomesModel {
    onTrack: number;
    contactId: string;
    personalInsuranceObjectivesId: string;
    incomeProtectionAnalysis: PersonalProtectionIncomeAnalysisModel;
    termLifeCover: PersonalProtectionCoverModel;
    tpdCover: PersonalProtectionCoverModel;
    traumaCover: PersonalProtectionCoverModel;
}
