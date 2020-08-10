
import { ApiDataResult } from '../../../common/api/api-data-result';
import {
    Contact, CurrentScenarioModel, HouseHoldResponse, PersonalInsuranceSummary,
    TotalInsuranceObjective, TotalPersonalInsurance, TotalPersonalInsuranceSummary
} from '../models';

export class PersonalOverviewState {

    readonly COLUMN_NUM = 3;
    houseHoldMembers: Contact[];
    keys: string[];
    rows: number[];
    totalPersonalInsuranceSummary: TotalPersonalInsuranceSummary;
    personalInsurances: PersonalInsuranceSummary[];
    houseHoldId: string;
    objectivies: TotalInsuranceObjective;
    outcomes: TotalPersonalInsurance;
    scenario: ApiDataResult<CurrentScenarioModel> = new ApiDataResult<CurrentScenarioModel>();

    updateData(data: HouseHoldResponse) {
        this.houseHoldMembers = data && data.members || [];
        this.keys = this.houseHoldMembers && this.houseHoldMembers.map(item => item.id);
        this.houseHoldId = data && data.id;
    }

    updateMemberOntrack() {
        this.houseHoldMembers.map(member => {
            let updatedMem = this.scenario.data.personalProtection.outcomes.find(m => m.contactId === member.id);
            if (updatedMem)
                member.onTrack = updatedMem.onTrack;
        });
    }

    updatePersonalSummary(res: any) {
        // {summaries: res, objectivies: res1, outcomes: res2, scenario: res3 }
        this.totalPersonalInsuranceSummary = res && res.summaries;
        this.objectivies = res && res.objectivies;
        this.outcomes = res && res.outcomes;
        this.scenario = res && res.scenario;
        this.personalInsurances = this.totalPersonalInsuranceSummary.getPersonalInsuranceSummarys(this.getIds());
        // if (this.houseHoldMembers && this.houseHoldMembers.length > 0 && this.scenario && this.scenario.data)
        //     this.updateMemberOntrack();
    }

    getIds() {
        return this.keys || this.houseHoldMembers && this.houseHoldMembers.map(item => item.id);
    }

    getClient(id: string) {
        return this.houseHoldMembers && this.houseHoldMembers.find(item => item.id === id);
    }

    getObjective(id: string) {
        return this.objectivies && this.objectivies.get(id);
    }

    getOutcome(id: string) {
        return this.outcomes && this.outcomes.get(id);
    }
}