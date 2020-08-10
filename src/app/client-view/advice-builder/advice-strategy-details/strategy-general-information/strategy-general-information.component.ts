import { Component, OnInit, Input, SimpleChanges, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ScenarioDetailsModel } from '../../../models';
import { Router } from '@angular/router';
import { BaseComponentComponent } from '../../../../common/components/base-component';

// service
import { AdviceBuilderService } from '../../advice-builder.service';
import { ConfigService } from '../../../../common/services/config-service';
import { HandleErrorMessageService } from '../../../../common/services/handle-error.service';
import { ClientViewService } from '../../../client-view.service';

declare var $: any;
@Component({
  selector: 'strategy-general-information',
  templateUrl: './strategy-general-information.component.html',
  styleUrls: ['./strategy-general-information.component.css'],
})


export class StrategyGeneralInformationComponent extends BaseComponentComponent implements OnInit {

  constructor(
    private router: Router,
    private adviceBuilderService: AdviceBuilderService,
    private clientViewService: ClientViewService,
    private handleErrorMessageService: HandleErrorMessageService,
    configService: ConfigService, changeDetectorRef: ChangeDetectorRef
  ) { super(configService, changeDetectorRef) }

  @Input() scenario: ScenarioDetailsModel = new ScenarioDetailsModel();
  @ViewChild('alertModal') alertModal: any;

  private strategyDuraton: number;

  ngOnInit() {
    this.initClosePopover();
    this.setupPopover();
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  private handleUpdateScenarioAfterApiResponse(res: any) {
    if (res.success) {
      this.scenario = res.data;
      this.adviceBuilderService.selectedScenario.cashFlow.details = res.data.cashFlow.details;
      const selectedStrategyName = this.scenario.scenarioName;
      localStorage.setItem('selectedStrategyName', selectedStrategyName);
      this.detectChange();
    } else {
      this.handleErrorMessageService.handleErrorResponse(res);
    }
  }

  private editScenario(memberIndex: number = 0) {
    let houseHoldId = localStorage.getItem('houseHoldID');
    let editScenario = this.cloneEditingScenario(this.scenario, memberIndex);
    if (!houseHoldId || !this.editScenario) {
      this.router.navigate(["/client-view/advice-builder"]);
    } else {
      this.adviceBuilderService.showLoading()
      this.adviceBuilderService.editStrategy(houseHoldId, editScenario).subscribe(res => {
        if (res.success)
          this.adviceBuilderService.reloadAllData();
        this.handleUpdateScenarioAfterApiResponse(res);
      });
    }
  }

  private cloneEditingScenario(scenario: ScenarioDetailsModel, memberIndex: number) {
    return JSON.parse(JSON.stringify({ scenarioId: scenario.scenarioId, scenarioName: scenario.scenarioName, familyMember: scenario.familyMembers[memberIndex] }));
  }

  private imgUrl(imgUrl: string) {
    return this.getImgUrl(imgUrl);
  }

  private deleteStrategy() {
    let houseHoldID = localStorage.getItem("houseHoldID");
    let selectedStrategyID = localStorage.getItem("selectedStrategyID");
    this.adviceBuilderService.showLoading()
    this.adviceBuilderService.deleteScenario(houseHoldID, selectedStrategyID).subscribe(response => {
      this.adviceBuilderService.hideLoading()
      if (response.success) {
        // redirect to advice builder page
        this.router.navigate(["/client-view/advice-builder"]);
      } else {
        this.handleErrorMessageService.handleErrorResponse(response);
      }
    })
  }
  
  private initClosePopover() {

    // close popover when click outside
    $('html').on('click', (e) => {
      if (!$(e.target).parents().is('.popover.in') && !$(e.target).parents().is('a')) {
        $('[rel="popover"]').popover('hide');
      }
    });

    $('.close-licence-name').click(() => {
      $('#licence-name').popover('hide');
    });
  }

  private setupPopover() {
    // close popover when click outside
    $('html').on('click', function (e) {
      if (!$(e.target).parents().is('.popover.in') && !$(e.target).parents().is('a')) {
        $('[rel="popover"]').popover('hide');
      }
    });

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

    // close and save popover handle
    $(".close-popover").click((e) => {
      this.hide();
    });

    $('.save-changes-popover.strategy-name').click((e) => {
      this.hide();
      let scenarioName = $('.popover #strategyName').val();
      this.scenario.scenarioName = scenarioName;
      localStorage.setItem('selectedStrategyName', scenarioName);
      // call api to update scenario name
      this.editScenario();
    });
  }

  private hide() {
    $('.popover').popover('hide');
  }

  private goToPage(page: string) {
    let url = '/client-view/advice-builder';
    if (page == 'advice-homepage') {
      localStorage.setItem('selectedStrategyID', '');
    }
    this.router.navigate([url]);
  }

  private confirmDeleteStrategy() {
    this.alertModal.show();
  }

  private getAlertMessage() {
    return "Are you sure you want to delete this strategy? This process cannot be undone.";
  }
}