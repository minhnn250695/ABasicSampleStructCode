import { Component, Input, OnInit } from "@angular/core";
import { ErrorCode } from "../../../../client-view/client-debt/models";
import { ConfirmationDialogService } from "../../../../common/dialog/confirmation-dialog/confirmation-dialog.service";
import { Pairs } from "../../../../revenue-import/models";
import { DataFeedsBaseComponent } from "../../../data-feeds-base-components.component";
import { DataFeedsStorage } from "../../../data-feeds-storage.service";
import { DataFeedsService } from "../../../data-feeds.service";
import { Entity, PlatFormData } from "../../../models";

declare var $: any;
@Component({
  selector: "app-desktop-broker-unmatch",
  styleUrls: ["./desktop-broker-unmatch.component.css"],
  templateUrl: "./desktop-broker-unmatch.component.html",
})
export class DesktopBrokerUnmatchComponent extends DataFeedsBaseComponent implements OnInit {

  //#region Properties
  @Input("unMatchList") unMatchList: Array<Entity<PlatFormData>> = [];

  warningMess = "";
  accountName: string;
  selectedId: string;
  isSelectAll = false;
  selectedEntity: Entity<PlatFormData> = new Entity<PlatFormData>();
  selectedRecord: PlatFormData = new PlatFormData();
  isSelectAccountName = false;
  isGotAssets = false;
  isDisableSearchBox: boolean;
  //#endregion

  //#region Constructors
  constructor(
    private dataFeedsService: DataFeedsService,
    private dataFeedsStorage: DataFeedsStorage,
    private confirmationDialogService: ConfirmationDialogService) {
    super();
  }

  ngOnInit() {
    this.selectedRecord.clientData = [];
  }

  ngOnDestroy() {
    this.onRecordSelectAll(false);
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('body').removeAttr("style");
  }
  //#endregion

  //#region Actions

  //#region View handlers
  txtSearchChanged() {
    const text = $("#account-name").val().trim();
    if (text === "") {
      this.selectedId = undefined;
      this.isSelectAccountName = false;
    }
  }

  getClientName(record: PlatFormData) {
    return record.accountData && record.accountData.accountName;
  }

  getPlaceHolder() {
    if (!this.dataFeedsStorage.assets) {
      this.accountName = "Loading data...";
      this.isDisableSearchBox = true;
      this.isGotAssets = false;
    }
    else if (!this.isGotAssets) { // the first time after we got assets then we need to init auto complete
      this.initAutoComplete(this.dataFeedsStorage.assets);
      this.isDisableSearchBox = false;
      this.isGotAssets = true;
      this.accountName = "Account Name";
    }
    return this.accountName;
  }
  //#endregion

  //#region Tickbox
  onRecordSelectAll(isCheckedAll: boolean) {
    // flag
    this.isSelectAll = !this.isSelectAll;

    if (this.unMatchList && this.unMatchList.length > 0) {
      this.unMatchList = this.unMatchList.map((item) => {
        item.isSelected = isCheckedAll;
        return item;
      });
    }
  }

  onRecordSelect(unMatchRecord: Entity<PlatFormData>) {
    if (unMatchRecord.isSelected)
      unMatchRecord.isSelected = false;
    else
      unMatchRecord.isSelected = true;
    const selectedRecords = this.unMatchList.filter((record) => record.isSelected === true);

    if (selectedRecords.length > 0)
      this.isSelectAll = true;
    else {
      this.isSelectAll = false;
    }
  }
  //#endregion

  //#region Button handlers
  btnYesClick(value: number) {
    /** Note: Currently if it is not overwrite => do not call api */
    if (value === 1) {// yes => overwrite
      this.runLoading.emit(true);
      this.dataFeedsService.updateClientAssetRecord(this.selectedEntity, value, true)
        .subscribe((responseCode) => {
          if (responseCode === 200) {
            this.isSelectAll = false;
            this.reloadData(true);
          }
          else
            console.log("error");
        });
    }
  }

  btnMatchingClick(record: Entity<PlatFormData>) {
    this.resetModal();
    if (record) {
      this.selectedEntity = record;
      this.selectedRecord = record.platformData;
      if (this.dataFeedsStorage.assets)
        this.initAutoComplete(this.dataFeedsStorage.assets);
    }
  }

  btnSaveClick() {
    if (this.updateValues()) {
      $("#match-modal").modal("hide");
      this.runLoading.emit(true);
      this.dataFeedsService.updateClientAssetRecord(this.selectedEntity, null, true)
        .subscribe((responseCode) => {
          if (responseCode === 200) {
            this.isSelectAll = false;
            this.reloadData(true);
          } else if (responseCode === ErrorCode.MANUAL_MATCH_CONFIRM_OVERWRITE) {
            console.log("duplicated record!!!");
            $("#desktop-broker-overwrite-warning").modal({
              backdrop: "static",
            });
            $("#desktop-broker-overwrite-warning").modal();
            this.reloadData(false);
          }
          else {
            console.log("error");
            this.reloadData(false);
          }
        });
    }
  }
  //#endregion

  //#endregion

  //#region Private
  private updateValues(): boolean {
    const selected = this.getSelectedValue();

    if (selected && this.selectedEntity) {
      this.selectedEntity.crmId = selected.id;
      this.selectedEntity.overwriteOption = 1;
      return true;
    }
    return false;
  }

  private getSelectedValue(): Pairs {
    const value = this.selectedId;
    if (!value) return null;
    const record = this.dataFeedsStorage.assets.find((x) => x.id === value);
    if (record)
      return record;
    return null;
  }

  private resetModal() {
    this.selectedEntity = new Entity<PlatFormData>();
    this.selectedRecord = new PlatFormData();
    this.isSelectAccountName = false;
    this.selectedId = undefined;
    $("#account-name").val("");
  }

  private initAutoComplete(records: Pairs[]) {
    if (records.length === 0 || records === undefined) {
      console.log("No source found!!");
      return;
    }

    $("#account-name").autocomplete({
      source: (request, response) => {
        const results = $.ui.autocomplete.filter(records, request.term);
        response(results.slice(0, 50));
      },
      select: (e, ui) => {
        this.selectedId = ui.item.id;
        this.isSelectAccountName = true;
      },
    });

    $("#account-name").autocomplete("option", "appendTo", "#unGroup");

  }
  //#endregion

}
