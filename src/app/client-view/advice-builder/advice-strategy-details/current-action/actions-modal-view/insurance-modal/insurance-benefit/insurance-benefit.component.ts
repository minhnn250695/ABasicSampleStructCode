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
    selector: 'insurance-benefit-view',
    templateUrl: './insurance-benefit.component.html',
    styleUrls: ['./insurance-benefit.component.css'],
})
export class InsuranceBenefitViewComponent implements OnInit {

    @Input() clientList: Array<OptionModel<string>> = [];
    @Input() benefitList: InsuranceBenefitActionModel[] = [];
    @Output() outputBenefit: EventEmitter<any> = new EventEmitter();

    private selectedBenefitId_toView: string = "-1";
    private benefit_view: InsuranceBenefitActionModel = new InsuranceBenefitActionModel();

    private benefitTypes: Array<OptionModel<number>> = [];
    private benefitPeriodTypes: Array<OptionModel<number>> = [];
    private waitingPeriodTypes: Array<OptionModel<number>> = [];
    private premiumTypes: Array<OptionModel<number>> = [];
    private baseAPIUrl: string = "";
    private BenefitType = BenefitType;

    constructor(
        private adviceBuilderService: AdviceBuilderService,
        private configService: ConfigService
    ) { }

    ngOnInit() {
        this.baseAPIUrl = this.configService.getApiUrl();
        this.initBenefitTypeList();
        this.initBenefitPeriodTypes();
        this.initWaitingPeriodTypes();
        this.initPremiumTypes();

        $('#insurance-view').on('hidden.bs.modal', () => {
            this.resetForm();
            this.collapseForm('collapseView');
        })
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

    public collapseForm(id: string) {
        $("#" + id).removeClass("in");
    }

    private unCollapseForm(id: string) {
        $("#" + id).addClass("in");
    }

    private selectViewBenefitChange() {
        let selectedBenfitList = this.benefitList.filter(item => item.id == this.selectedBenefitId_toView);
        this.benefit_view = selectedBenfitList && selectedBenfitList[0];
        this.selectViewBenefit(this.benefit_view);
    }

    //#region handle init data    
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
    //#endregion  handle init data

    //#region handle showing text for view benefit
    private getBenefitPersonInsuredText(personInsuredId) {
        let currentPremium = this.clientList.filter(item => item.code == personInsuredId);
        return currentPremium && currentPremium[0] && currentPremium[0].name || 'N/A'
    }

    private getBenefitTypeText(type) {
        let currentType = this.benefitTypes.filter(item => item.code == type);
        return currentType && currentType[0] && currentType[0].name || 'N/A'
    }

    private getBenefitPremiumTypeText(premiumType) {
        let currentPremium = this.premiumTypes.filter(item => item.code == premiumType);
        return currentPremium && currentPremium[0] && currentPremium[0].name || 'N/A'
    }

    private getBenefitWaitingPeiodText(waitingPeriod) {
        let currentWaitingPeriod = this.waitingPeriodTypes.filter(item => item.code == waitingPeriod);
        return currentWaitingPeriod && currentWaitingPeriod[0] && currentWaitingPeriod[0].name || 'N/A'
    }

    private getBenefitPeiodText(benefitPeriod) {
        let currentBenefitPeriod = this.benefitPeriodTypes.filter(item => item.code == benefitPeriod);
        return currentBenefitPeriod && currentBenefitPeriod[0] && currentBenefitPeriod[0].name || 'N/A'
    }

    //#endregion handle showing text for view benefit

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
        this.benefit_view = new InsuranceBenefitActionModel();
        this.selectedBenefitId_toView = "-1";
    }

    private selectViewBenefit(benefit: InsuranceBenefitActionModel) {
        this.unCollapseForm("collapseView");
        this.benefit_view = JSON.parse(JSON.stringify(benefit));
        this.selectedBenefitId_toView = benefit.id.toString();
    }
}

