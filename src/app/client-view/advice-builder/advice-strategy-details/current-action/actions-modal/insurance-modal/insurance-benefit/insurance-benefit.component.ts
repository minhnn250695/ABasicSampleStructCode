import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { OptionModel } from '../../../../../../../on-boarding/models';
import { InsuranceBenefitActionModel, BenefitPeriodType, WaitingPeriodType, PremiumType } from '../../../../../../models';
import { BenefitType } from '../../../../../../client-protection/models';
import { $injector } from '@uirouter/core';
import { AdviceBuilderService } from '../../../../../advice-builder.service';
import { BaseComponentComponent } from '../../../../../../../common/components/base-component';
import { ConfigService } from '../../../../../../../common/services/config-service';
import { LoginComponent } from '../../../../../../../security/login-container/login-desk/login.component';

declare var $: any;
@Component({
    selector: 'insurance-benefit',
    templateUrl: './insurance-benefit.component.html',
    styleUrls: ['./insurance-benefit.component.css'],
})
export class InsuranceBenefitComponent implements OnInit {

    @Input() clientList: Array<OptionModel<string>> = [];
    @Input() benefitList: InsuranceBenefitActionModel[] = [];
    @Output() outputBenefit: EventEmitter<any> = new EventEmitter();

    private selectedBenefitId_toDelete: number = undefined;
    private selectedBenefitId_toEdit: number = undefined;
    private benefit_edit: InsuranceBenefitActionModel = new InsuranceBenefitActionModel();
    private benefit_new: InsuranceBenefitActionModel = new InsuranceBenefitActionModel();

    private benefitTypes: Array<OptionModel<number>> = [];
    private benefitPeriodTypes: Array<OptionModel<number>> = [];
    private waitingPeriodTypes: Array<OptionModel<number>> = [];
    private premiumTypes: Array<OptionModel<number>> = [];
    private baseAPIUrl: string = "";
    private premium_New: string = "";
    private benefitAmount_New: string = "";
    private premium_Edit: string = "";
    private benefitAmount_Edit: string = "";
    private BenefitType = BenefitType;
    constructor(
        private adviceBuilderService: AdviceBuilderService,
        private configService: ConfigService
    ) { }

    ngOnInit() {
        this.initTooltip();
        this.baseAPIUrl = this.configService.getApiUrl();
        this.initBenefitTypeList();
        this.initBenefitPeriodTypes();
        this.initWaitingPeriodTypes();
        this.initPremiumTypes();
        $('#add-change-insurance').on('hidden.bs.modal', () => {
            this.resetForm();
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.benefitList && changes.benefitList.currentValue) {
            let index = 0;
            this.benefitList.forEach(benefit => {
                index++;
                benefit.tempId = index;
            });
        }
    }

    ngOnDestroy() {
    }

    initTooltip() {
        $('[data-toggle="tooltip"]').tooltip();
    }

    private addNewBenefit() {
        // set a temorary id
        let lastIndex = this.benefitList.length - 1;
        let lastBenefitID = lastIndex > -1 ? this.benefitList[lastIndex].tempId : 0;
        this.benefit_new.tempId = (lastBenefitID + 1);

        this.benefit_new.name = this.getBenefitTypeNameShortenForm(this.benefit_new.type);
        this.benefitList.push(this.benefit_new);

        // pass benefit list to insurance policy
        this.outputCurrentBenefitList();

        // reset value of add new benefit form
        this.resetForm();
        this.collapseForm("collapseNew");
        this.collapseForm("collapseEdit");
        this.collapseForm("collapseDelete");
    }

    private editBenefit() {
        // edit selected benefit from added benefit list
        if (!this.selectedBenefitId_toEdit) return;
        let index = -1;

        // check if edit benefit type is NOT Income protection => reset 2 period variable
        if (this.benefit_edit.type != BenefitType.Income_Protection) {
            this.benefit_edit.waitingPeriod = undefined;
            this.benefit_edit.benefitPeriod = undefined;
        }

        this.benefitList.forEach(benefit => {
            index++;
            if (benefit.tempId == this.selectedBenefitId_toEdit) {
                this.benefit_edit.name = this.getBenefitTypeNameShortenForm(this.benefit_edit.type);
                this.benefitList.splice(index, 1, this.benefit_edit);
                return;
            }
        });
        // reset value of edit benefit form
        this.resetForm();
        // emit current benefit list to insurance policy
        this.outputCurrentBenefitList();
        this.collapseForm("collapseNew");
        this.collapseForm("collapseEdit");
        this.collapseForm("collapseDelete");
    }

    private deleteSelectedBenefit() {
        // remove selected benefit from added benefit list
        if (!this.selectedBenefitId_toDelete) return;
        let index = -1;
        this.benefitList.forEach(benefit => {
            index++;
            if (benefit.tempId == this.selectedBenefitId_toDelete) {
                this.benefitList.splice(index, 1);
                return;
            }
        });
        // reset selected benefit id
        this.selectedBenefitId_toDelete = undefined;
        // pass benefit list to insurance policy
        this.outputCurrentBenefitList();
        this.collapseForm("collapseNew");
        this.collapseForm("collapseEdit");
        this.collapseForm("collapseDelete");
    }

    private collapseOtherAccordion(exceptType: number) {
        switch (exceptType) {
            // collapse other except new accordion
            case 1: {
                this.collapseForm("collapseEdit");
                this.collapseForm("collapseDelete");
                // check if new accordion is closed then clear data user typing
                const element = document.querySelector("#collapseNew");
                if (!element.classList.contains("in")) {
                    this.benefit_new = new InsuranceBenefitActionModel();
                }
                this.benefit_edit = new InsuranceBenefitActionModel();
                this.selectedBenefitId_toDelete = undefined;
                this.selectedBenefitId_toEdit = undefined;
                this.resetAmountAndPremium();
                break;
            }
            // collapse other except edit accordion
            case 2: {
                this.collapseForm("collapseNew");
                this.collapseForm("collapseDelete");
                // check if edit accordion is closed then clear data user typing
                const element = document.querySelector("#collapseEdit");
                if (!element.classList.contains("in")) {
                    this.selectedBenefitId_toEdit = undefined;
                    this.benefit_edit = new InsuranceBenefitActionModel();
                }
                this.benefit_new = new InsuranceBenefitActionModel();
                this.selectedBenefitId_toDelete = undefined;
                document.getElementById('collapseEdit').style.removeProperty("height");
                this.resetAmountAndPremium();
                break;
            }
            // collapse other except delete accordion
            case 3: {
                this.collapseForm("collapseNew");
                this.collapseForm("collapseEdit");
                // check if delete accordion is closed then clear data user typing
                const element = document.querySelector("#collapseDelete");
                if (!element.classList.contains("in")) {
                    this.selectedBenefitId_toDelete = undefined;
                }
                this.benefit_edit = new InsuranceBenefitActionModel();
                this.benefit_new = new InsuranceBenefitActionModel();
                this.selectedBenefitId_toEdit = undefined;
                this.resetAmountAndPremium();
                break;
            }
        }
    }

    private outputCurrentBenefitList() {
        let benefits_Temp: InsuranceBenefitActionModel[] = JSON.parse(JSON.stringify(this.benefitList));
        // pass benefit list to insurance policy
        this.outputBenefit.emit(benefits_Temp);
    }

    public collapseForm(id: string) {
        $("#" + id).removeClass("in");
    }

    private unCollapseForm(id: string) {
        $("#" + id).addClass("in");
    }

    private selectEditBenefitChange() {

        // let selectedEditBenefitID = event.target && event.target.value;
        if (!this.selectedBenefitId_toEdit) return;
        let temoraryBenefits = JSON.parse(JSON.stringify(this.benefitList));

        temoraryBenefits.forEach(benefit => {
            if (benefit.tempId == this.selectedBenefitId_toEdit) {
                this.benefit_edit = JSON.parse(JSON.stringify(benefit));
                //update premium and benefit amount to view
                this.updateCurrencySignToView();
                return;
            }
        });
    }

    private selectEditBenefit(benefit: InsuranceBenefitActionModel) {
        this.collapseOtherAccordion(2);
        this.unCollapseForm("collapseEdit");
        this.benefit_edit = JSON.parse(JSON.stringify(benefit));
        this.selectedBenefitId_toEdit = benefit.tempId;
        //update premium and benefit amount to view
        this.updateCurrencySignToView();
    }

    private updateCurrencySignToView() {
        if (this.benefit_edit.premium || this.benefit_edit.premium == 0) {
            this.premium_Edit = this.returnCurrenyFormat(this.benefit_edit.premium.toString());

        }
        if (this.benefit_edit.benefitAmount || this.benefit_edit.benefitAmount == 0) {
            this.benefitAmount_Edit = this.returnCurrenyFormat(this.benefit_edit.benefitAmount.toString());
        }
    }

    //#region handle showing and remove $ sign for premium and amount 

    private onNewPremiumFocus(value) {
        if (value && value != "") {
            this.premium_New = value.replace(/[^0-9.`-]+/g, "");
        }
    }

    private onNewPremiumFocusOut(value) {
        if (value && value != "") {
            this.premium_New = this.returnCurrenyFormat(value);
        }
    }

    private onNewPremiumKeyup(event) {
        let value = event.target && event.target.value;
        if (value && value != "")
            this.benefit_new.premium = value.replace(/[^0-9.`-]+/g, "");
    }

    private onEditPremiumFocus(value) {
        if (value && value != "") {
            this.premium_Edit = value.replace(/[^0-9.`-]+/g, "");
        }
    }

    private onEditPremiumFocusOut(value) {
        if (value && value != "") {
            this.premium_Edit = this.returnCurrenyFormat(value);
        }
    }

    private onEditPremiumKeyup(event) {
        let value = event.target && event.target.value;
        if (value && value != "")
            this.benefit_edit.premium = value.replace(/[^0-9.`-]+/g, "");
    }

    private onNewAmountFocus(value) {
        if (value && value != "") {
            this.benefitAmount_New = value.replace(/[^0-9.`-]+/g, "");
        }
    }

    private onNewAmountFocusOut(value) {
        if (value && value != "") {
            this.benefitAmount_New = this.returnCurrenyFormat(value);
        }
    }

    private onNewAmountKeyup(event) {
        let value = event.target && event.target.value;
        if (value && value != "")
            this.benefit_new.benefitAmount = value.replace(/[^0-9.`-]+/g, "");
    }

    private onEditAmountFocus(value) {
        if (value && value != "") {
            this.benefitAmount_Edit = value.replace(/[^0-9.`-]+/g, "");
        }
    }

    private onEditAmountFocusOut(value) {
        if (value && value != "") {
            this.benefitAmount_Edit = this.returnCurrenyFormat(value);
        }
    }

    private onEditAmountKeyup(event) {
        let value = event.target && event.target.value;
        if (value && value != "")
            this.benefit_edit.benefitAmount = value.replace(/[^0-9.`-]+/g, "");
    }

    private returnCurrenyFormat(number: string) {
        return '$' + number.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    }
    //#endregion

    private initBenefitTypeList() {
        this.benefitTypes = [
            { code: BenefitType.Life, name: "Life insurance" },
            { code: BenefitType.TPD, name: "Permanent disability" },
            { code: BenefitType.Trauma, name: "Trauma" },
            { code: BenefitType.Income_Protection, name: "Income protection" },
            { code: BenefitType.Child_Trauma, name: "Child trauma" },
            { code: BenefitType.Business_Expenses, name: "Business expenses" },
            { code: BenefitType.Accidental_Death, name: "Accidental Death" },
            { code: BenefitType.Needlestick_Benefit, name: "Needlestick Benefit" },
            { code: BenefitType.Accident_Benefit, name: "Accident Benefit" },
        ];
    }

    private initBenefitPeriodTypes() {
        this.benefitPeriodTypes = [
            { code: BenefitPeriodType._3Months, name: "3 months" },
            { code: BenefitPeriodType._6months, name: "6 months" },
            { code: BenefitPeriodType._1years, name: "1 years" },
            { code: BenefitPeriodType._2years, name: "2 years" },
            { code: BenefitPeriodType._5years, name: "5 years" },
            { code: BenefitPeriodType._6years, name: "6 years" },
            { code: BenefitPeriodType.Age50, name: "Age 50" },
            { code: BenefitPeriodType.Age55, name: "Age 55" },
            { code: BenefitPeriodType.Age60, name: "Age 60" },
            { code: BenefitPeriodType.Age65, name: "Age 65" },
            { code: BenefitPeriodType.Age66, name: "Age 66" },
            { code: BenefitPeriodType.Age70, name: "Age 70" },
            { code: BenefitPeriodType.Lifetime, name: "Life time" },
        ];
    }

    private initWaitingPeriodTypes() {
        this.waitingPeriodTypes = [
            { code: WaitingPeriodType._14days, name: "14 days" },
            { code: WaitingPeriodType._28days, name: "28 days" },
            { code: WaitingPeriodType._30days, name: "30 days" },
            { code: WaitingPeriodType._60days, name: "60 days" },
            { code: WaitingPeriodType._90days, name: "90 days" },
            { code: WaitingPeriodType._180days, name: "180 days" },
            { code: WaitingPeriodType._360days, name: "360 days" },
            { code: WaitingPeriodType._720days, name: "720 days" },
            { code: WaitingPeriodType._730days, name: "730 days" }
        ];
    }

    private initPremiumTypes() {
        this.premiumTypes = [
            { code: PremiumType.Hybrid, name: "Hybrid" },
            { code: PremiumType.Level65, name: "Level 65" },
            { code: PremiumType.Level70, name: "Level 70" },
            { code: PremiumType.Stepped, name: "Stepped" },
            { code: PremiumType.Unitised, name: "Unitised" },
        ]
    }

    /** Return benefit name from benefit type
     * @param value - benefit type
     */
    private getBenefitTypeNameShortenForm(value: number): string {
        if (value == BenefitType.Life)
            return "Life insurance";
        if (value == BenefitType.TPD)
            return "Permanent disability";
        if (value == BenefitType.Trauma)
            return "Trauma";
        if (value == BenefitType.Income_Protection)
            return "Income protection";
        if (value == BenefitType.Child_Trauma)
            return "Child trauma";
        if (value == BenefitType.Business_Expenses)
            return "Business expenses";
        if (value == BenefitType.Accidental_Death)
            return "Accidental death";
        if (value == BenefitType.Needlestick_Benefit)
            return "Needlestick benefit";
        if (value == BenefitType.Accident_Benefit)
            return "Accident benefit";
    }

    private getImageByPersonInsured(personInsuredId: string) {
        let members = this.adviceBuilderService.houseHold && this.adviceBuilderService.houseHold.members;
        let imgUrl = "";
        members.forEach(member => {
            if (member.id == personInsuredId)
                return imgUrl = member.profileImageUrl;
        });
        return (imgUrl && imgUrl != "") ? this.baseAPIUrl + imgUrl : '../../../../assets/img/default-profile.png';
    }

    private resetForm() {
        this.benefit_edit = new InsuranceBenefitActionModel();
        this.benefit_new = new InsuranceBenefitActionModel();
        this.selectedBenefitId_toDelete = undefined;
        this.selectedBenefitId_toEdit = undefined;
        this.resetAmountAndPremium()
    }

    private resetAmountAndPremium() {
        this.benefitAmount_Edit = undefined;
        this.benefitAmount_New = undefined;
        this.premium_Edit = undefined;
        this.premium_New = undefined;
    }

}

