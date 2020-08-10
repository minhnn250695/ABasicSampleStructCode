import { DebtType, HouseHoldResponse, InterestRateType, HouseHoldCashFlow, DebtCategoryType } from "../client-view/models";
import { BaseComponentComponent } from "../common/components/base-component";
import { AssetType, FrequencyType, MaritalStatusCode, OwnershipType, FundedFromType } from "../common/models";
import { ConfigService } from '../common/services/config-service';
import { OptionModel } from "./models";

export class OnBoardingCommonComponent extends BaseComponentComponent {

    constructor(configService?: ConfigService) {
        super(configService);
    }

    /**
     * get list of members' ids from household
     *
     * @param houseHold
     */
    getListContactId(houseHold: HouseHoldResponse): any {
        if (!houseHold) { return; }
        let listIds: string[] = [];
        houseHold.members.forEach((member) => {
            listIds.push(member.id);
        });
        return listIds;
    }

    getAssetType(): Array<OptionModel<number>> {
        let options: Array<OptionModel<number>> = [
            { name: "Bank Account", code: AssetType.Cash_Account },
            { name: "Rental Property", code: AssetType.Property },
            { name: "Superannuation", code: AssetType.Superannuation_Account },
            { name: "Investment fund", code: AssetType.Investment_Fund },
            { name: "Share portfolio", code: AssetType.Direct_Shares },
            { name: "Income stream", code: AssetType.Retirement_Income_Stream },
            { name: "Other", code: AssetType.Other },
        ];
        return options;
    }

    getDebtCategoryType(): Array<OptionModel<number>> {
        let options: Array<OptionModel<number>> = [
            { name: "Rental property loan", code: DebtCategoryType.RentalPropertyLoan },
            { name: "Investment loan ", code: DebtCategoryType.InvestmentLoan },
            { name: "Home mortgage ", code: DebtCategoryType.HomeMortgage },
            { name: "Car loan ", code: DebtCategoryType.CarLoan },
            { name: "Credit card ", code: DebtCategoryType.CreditCard },
            { name: "Personal loan", code: DebtCategoryType.PersonalLoan },
            { name: "Other", code: DebtCategoryType.Other },
        ];
        return options;
    }

    getMaritalStatusList(): Array<OptionModel<number>> {
        let options: Array<OptionModel<number>> = [
            { name: "Single", code: MaritalStatusCode.SINGLE },
            { name: "Married", code: MaritalStatusCode.MARRIED },
            { name: "De-facto", code: MaritalStatusCode.DE_FACTO },
            { name: "Divorced", code: MaritalStatusCode.DIVORCED },
            { name: "Separated", code: MaritalStatusCode.SEPARATED },
            { name: "Widowed", code: MaritalStatusCode.WIDOWED },
            { name: "Unknown", code: MaritalStatusCode.UNKNOWN },
        ];
        return options;
    }

    getFundedFromTypeForAction(): Array<OptionModel<number>> {
        let options: Array<OptionModel<number>> = [
            { name: "Cash Flow", code: 0 },
            { name: "Loan Balance", code: 1},
            { name: "Offset Account", code: 2 },
            { name: "Client Asset", code: 3 }
        ];
        return options;
    }

    getFundedFromType(): Array<OptionModel<number>> {
        let options: Array<OptionModel<number>> = [
            { name: "Cash Flow", code: FundedFromType.Cashflow },
            { name: "Loan Balance", code: FundedFromType.LoanBalance},
            { name: "Offset Account", code: FundedFromType.LoanOffsetAccount },
            { name: "Client Asset", code: FundedFromType.AssetBalance }
        ];
        return options;
    }

    getFundedFromTypeForDebtAction(): Array<OptionModel<number>> {
        let options: Array<OptionModel<number>> = [
            { name: "Cash Flow", code: 0 },
            { name: "Client Asset", code: 1 }
        ];
        return options;
    }


    getGenderList(): Array<OptionModel<number>> {
        let options: Array<OptionModel<number>> = [
            { name: "Male", code: 1 },
            { name: "Female", code: 2 },
        ];
        return options;
    }

    getOwnershipType(): Array<OptionModel<number>> {
        let options: Array<OptionModel<number>> = [
            { name: "Joint", code: OwnershipType.JOINT },
            { name: "Trust", code: OwnershipType.TRUST },
            { name: "Super Trust", code: OwnershipType.SUPER_TRUST },
            { name: "Company", code: OwnershipType.COMPANY },
        ];
        return options;
    }

    getFinanceFrequencyTypes(): Array<OptionModel<number>> {
        let options: Array<OptionModel<number>> = [
            { name: "Single Payment", code: FinanceFrequencyType.SinglePayment },
            { name: "Annual", code: FinanceFrequencyType.Annual },
        ];
        return options;
    }

    getFrequencyType(): Array<OptionModel<number>> {
        let options: Array<OptionModel<number>> = [
            { name: "Weekly", code: FrequencyType.WEEKLY },
            { name: "Fortnightly", code: FrequencyType.FORNIGHTLY },
            { name: "Monthly", code: FrequencyType.MONTHLY },
            { name: "Quarterly", code: FrequencyType.QUARTERLY },
            { name: "Half-Yearly", code: FrequencyType.HALF_YEARLY },
            { name: "Yearly", code: FrequencyType.YEARLY },
        ];
        return options;
    }

    getInterestRateType(): Array<OptionModel<number>> {
        let options: Array<OptionModel<number>> = [
            { name: "Fixed", code: InterestRateType.Fixed },
            { name: "Variable", code: InterestRateType.Variable },
            { name: "Unknown", code: undefined },
        ];
        return options;
    }

    getInvestmentType(): Array<OptionModel<number>> {
        let options: Array<OptionModel<number>> = [
            { name: "Rental property", code: 100000001 },
            { name: "Direct shares", code: 100000002 },
            { name: "Allocated pension", code: 3 },
            { name: "Annuity", code: 3 },
        ];
        return options;
    }

    getIncomeSource(): Array<OptionModel<number>> {
        let options: Array<OptionModel<number>> = [
            { name: "Gross Salary", code: 509000000 },
            { name: "Investment Income", code: 100000000 },
            { name: "Government benefits", code: 509000001 },
            { name: "Other", code: 509000002 },
        ];
        return options;
    }

    getEmployeeType(): Array<OptionModel<number>> {
        let options: Array<OptionModel<number>> = [
            { name: "Full time", code: 100000000 },
            { name: "Part-time", code: 100000001 },
            { name: "Casual", code: 100000003 },
            { name: "Self-employed", code: 100000006 },
        ];
        return options;
    }

    getPrimarySpouseFirstName(data: HouseHoldResponse): Array<OptionModel<number>> {
        let individual: Array<OptionModel<number>> = [];

        if (data.spouseClientId) {
            let spouse: any = data.members.find((member) => member.id === data.spouseClientId);
            if (spouse) {
                individual.push({ name: spouse.firstName, code: 100000000 });
            }
        }

        if (data.primaryClientId) {
            let primary: any = data.members.find((member) => member.id === data.primaryClientId);
            if (primary) {
                individual.push({ name: primary.firstName, code: 100000000 });
            }
        }

        return individual;
    }

    getPrimarySpouseFirstNameWithId(data: HouseHoldResponse): Array<OptionModel<string>> {
        let individual: Array<OptionModel<string>> = [];
        if (data.spouseClientId) {
            let spouse: any = data.members.find((member) => member.id === data.spouseClientId);
            if (spouse) {
                individual.push({ name: spouse.firstName || spouse.lastName, code: data.spouseClientId });
            }
        }

        if (data.primaryClientId) {
            let primary: any = data.members.find((member) => member.id === data.primaryClientId);
            if (primary) {
                individual.push({ name: primary.firstName || primary.lastName, code: data.primaryClientId });
            }
        }

        return individual;
    }

    getListMemberFirstName(houseHold: HouseHoldResponse): Array<OptionModel<string>> {
        if (!houseHold || !houseHold.members) { return; }

        let list: Array<OptionModel<string>> = [];
        houseHold.members.forEach((member) => {
            list.push({
                code: member.id,
                name: member.firstName,
            });
        });
        return list;
    }


    /**
     * 
     * @param keyCode: 32 = space
     * 27: esc
     * 18: alt
     * 91, 92: window
     * 13: enter of number key side
     * 9: tab
     * 8: backspace
     * 17: Ctr
     * 32: space
     */
    checkNumbersOnly(e: any) {
        var key = e.keyCode ? e.keyCode : e.which;
        if (!([8, 9, 13, 27, 91, 92, 18, 32].indexOf(key) !== -1 || // add , 190 or 110 into array if we want input have dot sign
            (key >= 48 && key <= 57) ||
            (key >= 96 && key <= 105)
        )) e.preventDefault();
    }
    /**
     * 
     * @param keyCode: 32 = space
     * 27: esc
     * 18: alt
     * 91, 92: window
     * 13: enter of number key side
     * 9: tab
     * 8: backspace
     * 17: Ctr
     * 16: shift
     * 32: space
     * 20: cabs lock
     * // 190 and 110 dot sign
     */
    checkTextOnly(e: any) {
        var key = e.keyCode ? e.keyCode : e.which;
        if (!([8, 9, 13, 27, 91, 92, 20, 16, 18, 32, 110, 190].indexOf(key) !== -1 || // add , 190 or 110 into array if we want input have dot sign
            (key >= 65 && key <= 90)
        )) e.preventDefault();
    }
}
export enum FinanceFrequencyType {
    SinglePayment,
    Annual
}