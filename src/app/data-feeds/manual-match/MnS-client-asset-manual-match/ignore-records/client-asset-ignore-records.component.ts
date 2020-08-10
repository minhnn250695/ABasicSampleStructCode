import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { Pairs } from '../../../../revenue-import/models';
import { DataFeedsBaseComponent } from '../../../data-feeds-base-components.component';
import { DataFeedsStorage } from '../../../data-feeds-storage.service';
import { DataFeedsService } from '../../../data-feeds.service';
import { ClientAsset, ClientAssetInstitution, Entity, Provider } from '../../../models';
import { ErrorCode } from './../../../../common/models';

declare var $: any;
@Component({
  selector: 'app-client-asset-ignore',
  templateUrl: './client-asset-ignore-records.component.html',
  styleUrls: ['./client-asset-ignore-records.component.css']
})
export class ClientAssetIgnoreRecordsComponent extends DataFeedsBaseComponent implements OnInit {

  @Input("ignoreList") ignoreList: Array<Entity<ClientAsset>> = [];

  isSelectAll: boolean = false;
  isSelectAccountName: boolean = false;

  selectedEntity: Entity<ClientAsset> = new Entity<ClientAsset>();
  selectedRecord: ClientAsset = new ClientAsset();
  selectedInstitution: ClientAssetInstitution = new ClientAssetInstitution();
  selectedId: string;

  constructor(private dataFeedsService: DataFeedsService, private dataFeedsStorage: DataFeedsStorage) {
    super();
  }

  ngOnInit() { }

  ngOnDestroy() {
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('body').removeAttr("style");
  }
  onRecordSelectAll(isCheckedAll: boolean) {
    // flag
    this.isSelectAll = !this.isSelectAll;

    this.ignoreList = this.ignoreList.map(item => {
      item.isSelected = isCheckedAll;
      return item;
    });
  }

  onRecordSelect(matchRecord: Entity<ClientAsset>) {

    if (matchRecord.isSelected)
      matchRecord.isSelected = false;
    else
      matchRecord.isSelected = true;

    let selectedRecords = this.ignoreList.filter(record => record.isSelected === true);

    if (selectedRecords.length > 0)
      this.isSelectAll = true;
    else {
      this.isSelectAll = false;
    }
  }

  btnDeleteClick() {
    let list = this.ignoreList.filter(record => record.isSelected === true);

    if (list.length > 0) {
      $("#delete").modal('show');
    }

  }

  btnMatchingClick(record: Entity<ClientAsset>) {
    this.resetModal();

    if (record) {
      this.selectedEntity = record;
      this.selectedRecord = record.entityData;
      this.selectedInstitution = record.entityData.financialInstitution;

      this.setAutocompleteData(this.selectedRecord.assetType);
    }
  }

  btnSaveClick() {
    let update = this.updateValues();

    // valid selection
    if (update) {
      $('#match').modal('hide');
      this.runLoading.emit(true);

      this.dataFeedsService.returnIgnoredRecord(this.selectedEntity)
        .subscribe(responseCode => {
          if (responseCode === 200) {
            this.isSelectAll = false;
            this.reloadData(true);
          }
          else if (responseCode === ErrorCode.MANUAL_MATCH_CONFIRM_OVERWRITE) {
            $('#ignore-match-warning').modal({
              backdrop: 'static',
            });

            $('#ignore-match-warning').modal("show");

            this.reloadData(false);
          }
          else {
            console.log("error");
            this.reloadData(false);
          }
        });
    }
  }

  btnYesClick(value: number) {
    if (value) {
      this.runLoading.emit(true);

      this.dataFeedsService.returnIgnoredRecord(this.selectedEntity, value)
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

  btnOKClick() {
    this.deleteRecords();
  }

  txtSearchChanged() {
    let text = $('#txtIgnored').val().trim();
    if (text === "") {
      this.selectedId = undefined;
    }
  }

  /**
   * PRIVATE SECTIONS
   *
   */

  private deleteRecords() {
    let deleteList = this.ignoreList.filter(item => item.isSelected === true);

    if (deleteList.length > 0) {
      this.runLoading.emit(true);

      this.dataFeedsService.deleteIgnoredList(deleteList, error => {
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

  private resetModal() {
    this.selectedEntity = new Entity<ClientAsset>();
    this.selectedRecord = new ClientAsset();
    this.selectedInstitution = new ClientAssetInstitution();
    this.selectedId = undefined;
    this.isSelectAccountName = false;

    $('#txtIgnored').val('');
  }

  private setAutocompleteData(type: number) {
    let source: Pairs[] = [];

    if (!type) return;

    if (type === 1 && this.dataFeedsStorage.assets)
      source = this.dataFeedsStorage.assets;
    if (type === 2 && this.dataFeedsStorage.debts)
      source = this.dataFeedsStorage.debts;
    else if (this.dataFeedsStorage.assets && this.dataFeedsStorage.debts)
      source = this.combineSources();

    this.initAutoComplete(source);
  }

  private updateValues() {

    let selected = this.getSelectedValue();

    if (selected) {
      // update info
      this.selectedEntity.crmId = selected.id;

      return true;
    }
    return false;
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

  private initAutoComplete(records: Pairs[]) {
    if (records.length === 0 || records === undefined) return;

    $("#txtIgnored").autocomplete({
      source: (request, response) => {
        let results = $.ui.autocomplete.filter(records, request.term);
        response(results.slice(0, 50));
      },
      select: (e, ui) => {
        this.selectedId = ui.item.id;
        this.isSelectAccountName = true;
      }
    });

    $("#txtIgnored").autocomplete("option", "appendTo", "#igGroup");

  }
}
