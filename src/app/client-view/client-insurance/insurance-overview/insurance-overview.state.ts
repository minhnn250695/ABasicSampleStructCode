
import { ApiDataResult } from '../../../common/api/api-data-result';
import {
    Contact, CurrentScenarioModel, HouseHoldResponse, PersonalInsuranceSummary,
    TotalInsuranceObjective, TotalPersonalInsurance, TotalPersonalInsuranceSummary
} from '../models';

export class InsuranceOverviewState {

    readonly COLUMN_NUM = 4;
    houseHoldMembers: Contact[];
    keys: string[];
    rows: number[];
    totalPersonalInsuranceSummary: TotalPersonalInsuranceSummary;
    personalInsurances: PersonalInsuranceSummary[];
    houseHoldId: string;
    objectivies: TotalInsuranceObjective;
    outcomes: TotalPersonalInsurance;
    scenario: ApiDataResult<CurrentScenarioModel> = new ApiDataResult<CurrentScenarioModel>();
    insuranceRows = [];
    isMobile: boolean = false;
    // For Mobile
    currentMemberInsuranceSummary: PersonalInsuranceSummary = new PersonalInsuranceSummary();
    currentMemberTotalInsuranceSummary: TotalPersonalInsuranceSummary;
    // displayedHouseHoldMembers: Contact[] = [];

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

    updatePersonalSummary(res: any, isMobile: boolean) {
        // {summaries: res, objectivies: res1, outcomes: res2, scenario: res3 }
        this.isMobile = isMobile;
        this.totalPersonalInsuranceSummary = res && res.summaries;
        this.objectivies = res && res.objectivies;
        this.outcomes = res && res.outcomes;
        this.scenario = res && res.scenario;
        this.personalInsurances = this.totalPersonalInsuranceSummary.getPersonalInsuranceSummarys(this.getIds());
        if (isMobile) {
            this.getCurrentMemberInsurance(0);
            this.getDisplayedHouseHoldMember();
        }
        // else
        this.calculateInsuranceInRows();
        if (this.houseHoldMembers && this.houseHoldMembers.length > 0 && this.scenario && this.scenario.data)
            this.updateMemberOntrack();
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

    calculateInsuranceInRows() {
        let index = 0;
        let rows = [];// content list of action rows
        let row = []; // each row have only 4 actions
        this.personalInsurances.forEach(action => {
            index++;
            if (index > 4) {
                rows.push(JSON.parse(JSON.stringify(row)));
                row = []; //reset current row
                index = 1; // reset index after push new first action;
            }
            row.push(action);
        });

        if (row.length > 0 && row.length <= 4) {
            rows.push(row);
        }
        this.insuranceRows = rows;
    }

    getCurrentMemberInsurance(index: number) {
        this.currentMemberInsuranceSummary = this.personalInsurances[index];
    }

    getDisplayedHouseHoldMember() {
        let contacts: Contact[] = [];
        this.personalInsurances.forEach(insurance => {
            let contact = this.getClient(insurance.primaryOwnerId);
            contacts.push(contact);
        });
        return contacts;
    }
}