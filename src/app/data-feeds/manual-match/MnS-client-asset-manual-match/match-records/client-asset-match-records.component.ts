import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Pairs } from '../../../../revenue-import/models/pairs.model';
import { DataFeedsBaseComponent } from '../../../data-feeds-base-components.component';
import { DataFeedsStorage } from '../../../data-feeds-storage.service';
import { DataFeedsService } from '../../../data-feeds.service';
import { ClientAsset, ClientAssetInstitution, Entity, ManualMatchModel, Provider } from '../../../models';
import { ErrorCode } from './../../../../common/models';

declare var $: any;

@Component({
  selector: 'app-client-asset-match',
  templateUrl: './client-asset-match-records.component.html',
  styleUrls: ['./client-asset-match-records.component.css']
})
export class ClientAssetMatchRecordsComponent extends DataFeedsBaseComponent implements OnInit {

  @Input("matchList") matchList: Array<Entity<ClientAsset>> = [];

  warningMess: string = "";
  selectedId: string;
  isSelectAll: boolean = false;
  selectedEntity: Entity<ClientAsset> = new Entity<ClientAsset>();
  selectedRecord: ClientAsset = new ClientAsset();
  selectedInstitution: ClientAssetInstitution = new ClientAssetInstitution();
  isSelectAccountName: boolean = false;
  accountName: string = "";
  constructor(private dataFeedsService: DataFeedsService, private dataFeedsStorage: DataFeedsStorage) {
    super();
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.onRecordSelectAll(false);
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('body').removeAttr("style");
  }

  onRecordSelectAll(isCheckedAll: boolean) {
    // flag
    this.isSelectAll = !this.isSelectAll;

    if (this.matchList && this.matchList.length > 0) {
      this.matchList = this.matchList.map(item => {
        item.isSelected = isCheckedAll;
        return item;
      });
    }
  }

  onRecordSelect(matchRecord: Entity<ClientAsset>) {

    if (matchRecord.isSelected)
      matchRecord.isSelected = false;
    else
      matchRecord.isSelected = true;

    let selectedRecords = this.matchList.filter(record => record.isSelected === true);

    if (selectedRecords.length > 0)
      this.isSelectAll = true;
    else {
      this.isSelectAll = false;
    }
  }

  btnIgnoreClick(record?: Entity<ClientAsset>) {

    let list = [];

    if (record) {
      list.push(record);
    }
    else {
      list = this.matchList.filter(item => item.isSelected === true);
    }

    if (list.length > 0) {
      this.runLoading.emit(true);

      this.dataFeedsService.ignoreList(list, error => {
        if (error) {
          console.log(error);
          this.reloadData(false);
        }
        else {
          this.isSelectAll = false;
          this.reloadData(true);
        }
      });
    }
  }

  btnSaveClick() {
    let update = this.updateValues();
    // valid selection
    if (update) {
      $('#ca-matched-modal').modal('hide');
      this.runLoading.emit(true);

      let form = this.createUpdateForm(this.selectedEntity);
      this.dataFeedsService.updateMatchedRecords(form)
        .subscribe(responseCode => {
          if (responseCode === 200) {
            this.isSelectAll = false;
            this.reloadData(true);
          }
          else if (responseCode === ErrorCode.MANUAL_MATCH_CONFIRM_OVERWRITE) {
            $('#manual-match-warning').modal({
              backdrop: 'static',
            });

            if (this.selectedEntity.information.assetType === 1)
              this.warningMess = "The selected client asset is already matched with another record.";
            if (this.selectedEntity.information.assetType === 2)
              this.warningMess = "The selected client debt is already matched with another record.";

            $('#manual-match-warning').modal("show");

            this.reloadData(false);
          }
          else {
            console.log("error");
            this.reloadData(false);
          }
        });
    }
  }

  btnImportClick() {
    let list = this.matchList.filter(record => record.isSelected === true);

    if (list && list.length > 0) {
      this.runLoading.emit(true);

      this.dataFeedsService.importClientAssetFromMoneySoftToCRM(list, error => {
        if (error) {
          console.log(error);
          this.reloadData(false);
        }
        else {
          if (this.matchList.filter(record => record.isSelected === false).length === 0)
            this.uploadAll.emit(true);
          this.isSelectAll = false;
          this.reloadData(true);
        }
      });
    }
  }

  btnMatchingClick(record) {
    this.resetModal();

    if (!record.information) { return; }
    if (record) {
      this.selectedEntity = record;
      this.selectedRecord = record.information;
      this.selectedInstitution = record.information.financialInstitution;
      // init  account source list
      let source = this.combineSources();
      let selectedAsset = source.filter(x => x.id === this.selectedRecord.crmId);
      this.accountName = selectedAsset.length > 0 ? selectedAsset[0].value : "Account Name";
      this.setAutocompleteData(this.selectedRecord.assetType);
    }
  }

  btnYesClick(value: number) {
    if (value) {
      this.runLoading.emit(true);
      let form = this.createUpdateForm(this.selectedEntity, value);
      this.dataFeedsService.updateMatchedRecords(form)
        .subscribe(responseCode => {
          if (responseCode === 200) {
            this.isSelectAll = false;
            this.reloadData(true);
          }
          else
            console.log("error");
        });
    }
  }

  txtSearchChanged() {
    let text = $('#ca-names').val().trim();
    if (text === "") {
      this.selectedId = undefined;
      this.isSelectAccountName = false;
    }
  }

  /**
   *  PRIVATE SECTIONS
   *
   */

  private createUpdateForm(entity: Entity<ClientAsset>, option?: number): ManualMatchModel {
    if (!entity) return;
    let form: ManualMatchModel = {
      providerName: entity.providerName,
      entityName: entity.entityName,
      externalId: entity.externalId,
      crmId: entity.crmId,
      overwriteOption: option
    };
    return form;
  }

  private resetModal() {
    this.selectedRecord = new ClientAsset();
    this.selectedInstitution = new ClientAssetInstitution();
    this.isSelectAccountName = false;
    this.selectedId = undefined;
    $('#ca-names').val('');
  }

  private updateValues(): boolean {

    let selected = this.getSelectedValue();

    if (selected) {
      // update info
      this.selectedEntity.crmId = selected.id;
      return true;
    }
    return false;
  }

  private getSelectedValue(): Pairs {

    let value = this.selectedId;

    if (!value) return null;

    if (this.selectedRecord.assetType === 1) {
      let record = this.dataFeedsStorage.assets.find(x => x.id === value);
      if (record)
        return record;
    }

    if (this.selectedRecord.assetType === 2) {
      let record = this.dataFeedsStorage.debts.find(x => x.id === value);
      if (record)
        return record;
    }

    else {
      let record = this.combineSources().find(x => x.id === value);
      if (record)
        return record;
    }

    return null;
  }

  private setAutocompleteData(type: number) {
    let source: Pairs[] = [];

    // if (!type) return;

    if (type === 1 && this.dataFeedsStorage.assets)
      source = this.dataFeedsStorage.assets;
    if (type === 2 && this.dataFeedsStorage.debts)
      source = this.dataFeedsStorage.debts;
    else if (this.dataFeedsStorage.assets && this.dataFeedsStorage.debts)
      source = this.combineSources();

    this.initAutoComplete(source);
  }

  private combineSources(): Pairs[] {
    let source: Pairs[] = [];

    if (this.dataFeedsStorage.assets && this.dataFeedsStorage.debts) {
      this.dataFeedsStorage.assets.forEach(asset => {
        source.push(asset);
      });

      this.dataFeedsStorage.debts.forEach(debt => {
        source.push(debt);
      });
    }

    return source;
  }

  private initAutoComplete(records: Pairs[]) {
    if (records === undefined || records.length === 0) return;

    $("#ca-names").autocomplete({
      source: (request, response) => {
        let results = $.ui.autocomplete.filter(records, request.term);
        response(results.slice(0, 50));
      },
      select: (e, ui) => {
        this.selectedId = ui.item.id;
        this.isSelectAccountName = true;
      }
    });

    $("#ca-names").autocomplete("option", "appendTo", "#ca-group");

  }

}
