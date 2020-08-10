import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs';
// models
import { Contact, HouseHoldResponse, TotalClientRetirement, ClientCalculation } from '../../models';
// services
import { ClientViewService } from '../../client-view.service';
import { FpStorageService } from '../../../local-storage.service';
import { LoaderService } from '../../../common/modules/loader';
import { ThirdPartyService } from '../../../third-party/third-party.service';

// bases
import { BaseComponentComponent } from '../../../common/components/base-component/base-component.component';
import { ConfigService } from '../../../common/services/config-service';

declare var $: any;

@Component({
    selector: 'fp-client-retirement',
    templateUrl: './client-retirement.component.html',
    styleUrls: ['./client-retirement.component.css'],
    providers: [ThirdPartyService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientRetirementComponent extends BaseComponentComponent implements OnInit, OnDestroy {
    // @Input("houseHolds") houseHoldSubject: BehaviorSubject<HouseHoldResponse>;

    private clientCalculation: ClientCalculation = new ClientCalculation();

    private retirmentYear: number = null;
    private houseHoldRetirementIncome: number;
    private currentYear: number = new Date().getFullYear();
    // 
    private readonly avgAgeWorkStarts = 20;
    private readonly maxLifeExpectancy = 95;
    isInvestfitThirdPartyEnabled: boolean;

    constructor(private clientService: ClientViewService,
        // private loaderService: LoaderService,
        private router: Router,
        private thirdPartyService: ThirdPartyService,
        configService: ConfigService,
        changeDetectorRef: ChangeDetectorRef) {
        super(configService, changeDetectorRef)
    }

    ngOnInit() {
        super.onBaseInit();
        this.onBaseInit();
        this.setupPopover();
        this.checkUsingMobile();

        let user = JSON.parse(localStorage.getItem('authenticatedUser'));
        if (user.roleAccess && user.roleAccess[0]) {
            if (user.roleAccess[0].name == "PortalBusinessAdmin" || user.roleAccess[0].name == "PortalBusinessStaff") {
                this.thirdPartyService.getThirdPartyInfo('Investfit').subscribe(result => {
                    this.isInvestfitThirdPartyEnabled = result.enabled;
                    this.detectChange();
                });
            }
        }

        this.clientService.clientCalculationEvent.subscribe((res: ClientCalculation) => {
            this.retirmentYear = res && res.houseHoldRetirmentYear();
            this.houseHoldRetirementIncome = res && res.houseHoldRetirementIncome();
            this.clientCalculation = res;
            this.detectChange();
        })
    }

    ngOnDestroy() {
        this.onBaseDestroy();
        $('[rel="popover"]').popover('hide');
    }

    getInvestfitReport() {
        this.router.navigate(["client-view/retirement-report"]);
    }

    setupPopover() {

        // close popover when click outside
        $('html').on('click', function (e) {
            if (!$(e.target).parents().is('.popover.in') && !$(e.target).parents().is('a')) {
                $('[rel="popover"]').popover('hide');
            }
        });

        $('[rel="popover"]').popover({
            container: 'body',
            html: true,
            trigger: 'manual',
            content: function () {
                var clone = $($(this).data('popover-content')).clone(true).removeClass('hide');
                return clone;
            }
        });

        $('.close-popover').click((e) => {
            $('[rel="popover"]').popover('hide');
        });

        $('.save-changes').click(e => {
            let textRetirementIncome = $('.popover #textRetirementIncome').val();


            if (textRetirementIncome && textRetirementIncome != this.houseHoldRetirementIncome) {
                this.updateRetirementIncome(parseFloat(textRetirementIncome));
            }

            $('#incomeTargetPopover').popover('hide')
        });
    }

    /**
     * update house hold retirement income
     * @param income 
     */
    private updateRetirementIncome(income: number) {
        // this.loaderService.show();
        this.clientService.showLoading();
        let houseHoldId = this.clientCalculation && this.clientCalculation.getHouseHoldId();

        this.clientService.updateRetirementIncome(houseHoldId, income).subscribe(res => {
            // this.loaderService.hide();
            this.clientService.hideLoading();
            this.houseHoldRetirementIncome = income;
            this.detectChange();
        }, err => {
            // this.loaderService.hide();
            this.clientService.hideLoading();
        });
    }

    /**
     * VIEW DATA BINDING
     */
    private getRetirementYearPercent() {
        return this.clientCalculation && this.clientCalculation.getRetirementYearPercent();
    }

    private getRetirementIncomePercentage() {
        return this.clientCalculation && this.clientCalculation.retirementIncomePercentage(this.houseHoldRetirementIncome);
    }

    private getCurrentIncome() {
        return this.clientCalculation && this.clientCalculation.retirementIncomeEquivalent();
    }

    private getRetirementIncome() {
        return this.houseHoldRetirementIncome;
    }

    private yearsUntilRetirement() {
        return this.clientCalculation && this.clientCalculation.yearsUntilRetirement();
    }

    private lifeExpectencyYear() {
        return (this.retirmentYear || 0) + this.yearsInRetirement();
    }

    private yearsInRetirement() {
        return this.clientCalculation && this.clientCalculation.yearsInRetirement();
    }

    private retirementCapital() {
        return this.clientCalculation && this.clientCalculation.retirementCapital();
    }

    private retirementCapitalEquivalent() {
        return this.clientCalculation && this.clientCalculation.retirementCapitalEquivalent();
    }

    private retirementIncome() {
        return this.clientCalculation && this.clientCalculation.retirementIncome();
    }

    private retirementIncomeEquivalent() {
        return this.clientCalculation && this.clientCalculation.retirementIncomeEquivalent();
    }
}
