import { Component, OnInit } from '@angular/core';
import { Pairs } from '../../../revenue-import/models';
import { AdviceBuilderService } from '../../advice-builder/advice-builder.service';

declare var $: any;
@Component({
  selector: 'new-action-button',
  templateUrl: './new-action-button.component.html',
  styleUrls: ['./new-action-button.component.css'],
})
export class NewActionButtonComponent implements OnInit {

  private actionRecords: Pairs[] = [
    { id: "add-asset", value: "Create new Asset" },
    { id: "close-asset", value: "Close an existing Asset" },
    { id: "transfer-asset-debt", value: "Transfer funds from asset to debt record" },
    { id: "transfer-asset-to-asset", value: "Transfer funds between two assets" },
    { id: "add-debt", value: "Create new Debt" },
    { id: "add-insurance", value: "Recommend New Insurance Policy" },
    { id: "change-insurance", value: "Changes to an existing Insurance Policy" },
    { id: "cancel-insurance", value: "Cancel an existing policy" }
  ];

  constructor(
    private adviceBuilderService: AdviceBuilderService
  ) { }

  ngOnInit() {
    this.initAutoComplete("search-action", this.actionRecords);
    $('html').on('click', (e) => {
        if (!$(e.target).parents().is('.collapse.in') && !$(e.target).is('#addActionButton')) {

        this.collapseActionButton();
      }
    });
  }

  private initAutoComplete(id: string, records: Pairs[]) {
    if (records === undefined || records.length === 0) return;
    const item = $("#" + id);
    item.autocomplete({
      source: (request, response) => {
        let results = $.ui.autocomplete.filter(records, request.term);
        response(results.slice(0, 50));
      },
      open: () => {
        $('.ui-autocomplete').css('width', '174px');
      },
      select: (e, ui) => {
        this.openActionModal(ui.item.id);
      }
    });
    item.autocomplete("option", "appendTo", "#action-search-group");
  }

  private onClickAddNewActions() {
    // colappse goal menu
    $("#collapGoalMenu").removeClass("in");
    $('#search-action').val('');
    this.hideAnotherActionSubcategory('hide-all');
  }

  private collapseActionButton() {
    $("#menuActions").removeClass("in");
    $('#search-action').val('');
    this.hideAnotherActionSubcategory('hide-all');
  }

  private openActionModal(id: string) {
    if (id == 'add-insurance') {
      // set flag to indicate Create new insurance
      this.isChangeInsurancePolicy(false);
      id = 'add-change-insurance'
    } else if (id == 'change-insurance') {
      // set flag to indicate Create change insurance
      this.isChangeInsurancePolicy(true);
      id = 'add-change-insurance';
    }
    $('#' + id).modal('show');
  }

  private showActionSubcategoty(id: string) {
    $("#" + id).addClass("in");
    this.hideAnotherActionSubcategory(id);
  }

  private hideAnotherActionSubcategory(subCategoryID: string) {
    switch (subCategoryID) {
      case 'assets-actions': {
        $("#debt-actions").removeClass("in");
        $("#insurance-actions").removeClass("in");
        break;
      };
      case 'debt-actions': {
        $("#assets-actions").removeClass("in");
        $("#insurance-actions").removeClass("in");
        break;
      };
      case 'insurance-actions': {
        $("#assets-actions").removeClass("in");
        $("#debt-actions").removeClass("in");
        break;
      };
      default: {
        $("#assets-actions").removeClass("in");
        $("#debt-actions").removeClass("in");
        $("#insurance-actions").removeClass("in");
      }
    }
  }

  private focusOutActionMenu() {
    const btnGoalNone = document.getElementById("btn-none");
    btnGoalNone.click();
  }

  private isChangeInsurancePolicy(isChangePolicy: boolean) {
    this.adviceBuilderService.isChangeExistingPolicy = isChangePolicy;
    this.focusOutActionMenu();
  }
}
