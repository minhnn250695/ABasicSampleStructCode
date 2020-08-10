import { Component, OnInit, Input, Output, EventEmitter, } from "@angular/core";
import { OnBoardingCommonComponent } from '../../../on-boarding-common.component';
import { InsuranceBenefit, BenefitType } from '../../../../client-view/client-protection/models';
import { OptionModel } from '../../../models';
import { OnBoardingService } from '../../../on-boarding.service';
import { HandleFinancialSituationService } from '../../handle-financial-situation.service';

declare var $: any;
@Component({
    selector: "app-insurance-benefits",
    templateUrl: "./insurance-benefits.component.html",
    styleUrls: ["./insurance-benefits.component.css"]
})

export class InsuranceBenefitsComponent extends OnBoardingCommonComponent implements OnInit {
    //#region Properties
    @Input() id: string;
    @Input() benefit: InsuranceBenefit = new InsuranceBenefit();
    @Output("remove") remove: EventEmitter<string> = new EventEmitter();

    benefitTypes: OptionModel<number>[] =
        [{ code: 100000000, name: "Life insurance" }
            , { code: 100000001, name: "Permanent disability" }
            , { code: 100000002, name: "Trauma" }
            , { code: 100000003, name: "Income protection" }
            , { code: 100000005, name: "Child trauma" }
            , { code: 100000004, name: "Business expenses" }];

    memberFirstNameList: OptionModel<string>[] = [];
    //#endregion

    //#region Constructors
    constructor(protected onboardingService: OnBoardingService, private _financialService: HandleFinancialSituationService) {
        super();
    }

    ngOnInit() {
        super.initPopover();
        this.setupPopover();
        this.memberFirstNameList = this.getListMemberFirstName(this.onboardingService.houseHold);
    }
    //#endregion

    //#region Initial popover
    initPopoverData() {
        if (this.benefit) {
            $('.popover #content' + this.id + ' #benefit-type').val(this.benefit.type.toString());
            $('.popover #content' + this.id + ' #person-insured').val(this.benefit.lifeInsuredId);
        }
    }

    closePopover() {
        $('#update-benefits' + this.id).popover('hide');
    }
    //#endregion

    //#region Helpers
    getBenefitTypeName(value: number): string {
        switch (value) {
            case BenefitType.Life: return "Life insurance";
            case BenefitType.TPD: return "Permanent disability";
            case BenefitType.Trauma: return "Trauma";
            case BenefitType.Income_Protection: return "Income";
            case BenefitType.Child_Trauma: return "Child";
            case BenefitType.Business_Expenses: return "Business";
            case BenefitType.Accidental_Death: return "Accidental Death";
            case BenefitType.Accident_Benefit: return "Accident Benefit";
            case BenefitType.Needlestick_Benefit: return "Needlestick Benefit";
        }
    }

    getBenefitIcon(value: number): string {
        switch (value) {
            // Life insurance
            case BenefitType.Life: return "fas fa-life-ring fa-2x";
            // Permanent disability
            case BenefitType.TPD: return "fas fa-wheelchair fa-2x";
            // Trauma
            case BenefitType.Trauma: return "fas fa-briefcase-medical fa-2x";
            // Income
            case BenefitType.Income_Protection: return "fas fa-umbrella fa-2x";
            // Child
            case BenefitType.Child_Trauma: return "fas fa-child fa-2x";
            // business
            case BenefitType.Business_Expenses: return "fas fa-briefcase fa-2x";
            // accidental death
            case BenefitType.Accidental_Death: return "fas fa-briefcase fa-2x";
            // accident benefit
            case BenefitType.Accident_Benefit: return "fas fa-briefcase fa-2x";
            // needlesstick benefit
            case BenefitType.Needlestick_Benefit: return "fas fa-briefcase fa-2x";
        }
    }

    setupPopover() {
        let popOver = $('[rel="popover"]');
        popOver.popover({
            container: 'body',
            html: true,
            trigger: 'manual',
            content: function () {
                var clone = $($(this).data('popover-content')).clone(true).removeClass('hide');
                return clone;
            }
        });

        // close popover when click outside
        $('html').on('click', function (e) {
            if (!$(e.target).parents().is('.popover.in') && !$(e.target).parents().is('a')) {
                $('[rel="popover"]').popover('hide');
            }
        });

        // close popover
        $(".close-popover").click((e) => {
            this.closePopover();
        });

        // save changes
        $('.update').click(() => {
            let type = $('.popover #content' + this.id + ' #benefit-type').val();
            let personInsured = $('.popover #content' + this.id + ' #person-insured').val();
            let amount = parseFloat($('.popover #content' + this.id + ' #amount').val());
            let premium = parseFloat($('.popover #content' + this.id + ' #premium').val());

            // update changes to benefit
            if (type && personInsured && amount && premium) {
                let temp = new InsuranceBenefit();
                temp.id = this.benefit ? this.benefit.id : null;
                temp.type = type;
                temp.lifeInsuredId = personInsured;
                temp.amount = amount;
                temp.insurancePremium = premium;

                this._financialService.updateInsuranceBenefit(parseInt(this.id), temp);
                this.closePopover();
            }
        });

        // remove clicked
        $('.remove').click(() => {
            // close popover
            this.closePopover();

            // emit remove benefit event
            this.remove.emit(this.id);
        });
    }
    //#endregion
}
