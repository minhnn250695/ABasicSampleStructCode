import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { AdviceBuilderService } from '../../../../advice-builder.service';
import { Router } from '@angular/router';
import { AssetActionModel, InvestmentStyle } from '../../../../../models';
import { OnBoardingService } from '../../../../../../on-boarding/on-boarding.service';
import { OptionModel } from '../../../../../../on-boarding/models';
import { OnBoardingCommonComponent } from '../../../../../../on-boarding/on-boarding-common.component';
import { Pairs, FundedFromType } from '../../../../../../revenue-import/models';
import { ConfirmationDialogService } from '../../../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { ParseError } from '@angular/compiler';
import { HandleErrorMessageService } from '../../../../../../common/services/handle-error.service';
declare var $: any;

@Component({
  selector: 'asset-view-modal',
  templateUrl: './asset-modal.component.html',
  styleUrls: ['./asset-modal.component.css'],
})
export class AssetViewModalComponent extends OnBoardingCommonComponent implements OnInit {

  @Input() asset: AssetActionModel = new AssetActionModel();
  // @Input() actionID: string;
  @Input() ownerShipTypes: any;
  @Input() frequencyList: any;
  @Input() activeAssetList: any[];
  @Input() activeDebtList: any[];
  @Input() assetTypes: any[];

  private selectedOwnershipType: string = "";
  private makeContribution: boolean = false;
  private receiveContribution: boolean = false;
  private contributionTypes: Array<OptionModel<number>> = [{ name: "Pre-Tax", code: 1 }, { name: "Post-Tax", code: 2 }];
  private investmentStyles: Array<OptionModel<number>>;
  private fundedFromList: Array<OptionModel<number>>;
  private isValidValue: boolean = true;
  constructor(
    private adviceBuilderService: AdviceBuilderService,
    private handleErrorMessageService: HandleErrorMessageService,
    private router: Router,
    private onBoardingService: OnBoardingService,
    private confirmationDialogService: ConfirmationDialogService
  ) { super(); }

  ngOnInit() {
    this.fundedFromList = this.getFundedFromTypeForAction();
    this.investmentStyles = this.getInvestmentTypes();
    $('#asset-view').on('hidden.bs.modal', () => {
      $('#asset-details').click();
    });
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes.asset && changes.asset.currentValue) {
      // update ownership type on view
      if (this.asset.ownershipType == 100000000) {
        this.selectedOwnershipType = this.asset.primaryClientId;
      } else if (this.asset.ownershipType) {
        this.selectedOwnershipType = this.asset.ownershipType.toString();
      }
      this.makeContribution = this.asset.makeContributions ? this.asset.makeContributions : false;
      this.receiveContribution = this.asset.receiveContributions ? this.asset.receiveContributions : false;

      this.checkValidValue();
    }
  }


  ngOnDestroy() {
    // resolve the issue unclickable when press "ESC" key
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('body').removeAttr("style");
  }

  private checkValidValue() {
    let source = [];
    let sourceId = this.asset.sourceId;
    this.isValidValue = true;
    if (this.asset.sourceOfFunds == FundedFromType.AssetBalance) {
      source = this.activeAssetList.filter(item => item.id == sourceId);

    } else if (this.asset.sourceOfFunds == FundedFromType.LoanBalance ||
      this.asset.sourceOfFunds == FundedFromType.LoanOffsetAccount) {
      source = this.activeDebtList.filter(item => item.id == sourceId);
    }
    if ((source.length <= 0) && (sourceId && sourceId != '')) {
      this.isValidValue = false;
    }
  }

  private getAssetTypeText(type: number) {
    let assetType = this.assetTypes.filter(item => item.value == type);
    return assetType[0] && assetType[0].label || 'N/A';
  }

  private getOwnershipTypeText(type) {
    if (type == 100000000) {
      type = this.asset.primaryClientId;
    }
    let ownerShip = this.ownerShipTypes.filter(item => item.code == type);
    return ownerShip[0] && ownerShip[0].name || 'N/A';
  }

  private getContributionTypeText(type: number) {
    let contribution = this.contributionTypes.filter(item => item.code == type);
    return contribution[0] && contribution[0].name || 'N/A';
  }

  private getFrequencyText(value: number) {
    let frequency = this.frequencyList.filter(item => item.code == value);
    return frequency[0] && frequency[0].name || 'N/A';
  }

  private getInvestmentTypeText(type: number) {
    let investment = this.investmentStyles.filter(item => item.code == type);
    return investment[0] && investment[0].name || 'N/A';
  }

  private getFundFromText(sourceOfFunds) {
    let fundFrom = this.fundedFromList.filter(item => item.code == sourceOfFunds);
    return fundFrom[0] && fundFrom[0].name || 'N/A';
  }

  private getSourceText(sourceId) {
    let source = [];
    if (this.asset.sourceOfFunds == FundedFromType.AssetBalance) {
      source = this.activeAssetList.filter(item => item.id == sourceId);
    } else if (this.asset.sourceOfFunds == FundedFromType.LoanBalance ||
      this.asset.sourceOfFunds == FundedFromType.LoanOffsetAccount) {
      source = this.activeDebtList.filter(item => item.id == sourceId);
    }
    return source[0] && source[0].name || 'N/A';
  }

  private getInvestmentTypes(): Array<OptionModel<number>> {
    let options: Array<OptionModel<number>> = [
      { name: "Defensive", code: InvestmentStyle.Defensive },
      { name: "Conservative", code: InvestmentStyle.Conservative },
      { name: "Balanced", code: InvestmentStyle.Balanced },
      { name: "Growth", code: InvestmentStyle.Growth },
      { name: "Aggressive", code: InvestmentStyle.Aggressive },
      { name: "Custom", code: InvestmentStyle.Custom },
    ];
    return options;
  }
}

