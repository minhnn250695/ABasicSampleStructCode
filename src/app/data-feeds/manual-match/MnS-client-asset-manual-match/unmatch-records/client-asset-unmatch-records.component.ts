import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { Pairs } from '../../../../revenue-import/models';
import { DataFeedsBaseComponent } from '../../../data-feeds-base-components.component';
import { DataFeedsStorage } from '../../../data-feeds-storage.service';
import { DataFeedsService } from '../../../data-feeds.service';
import { ClientAsset, ClientAssetInstitution, Entity } from '../../../models';
import { ErrorCode } from './../../../../common/models';

declare var $: any;
@Component({
  selector: 'app-client-asset-unmatch',
  templateUrl: './client-asset-unmatch-records.component.html',
  styleUrls: ['./client-asset-unmatch-records.component.css']
})
export class ClientAssetUnmatchRecordsComponent extends DataFeedsBaseComponent implements OnInit {

  @Input("unMatchList") unMatchList: Array<Entity<ClientAsset>> = [];

  selectedEntity: Entity<ClientAsset> = new Entity<ClientAsset>();
  selectedRecord: ClientAsset = new ClientAsset();
  selectedInstitution: ClientAssetInstitution = new ClientAssetInstitution();
  selectedId: string;

  isSelectAll: boolean = false;
  isSelectAccountName: boolean = false;

  constructor(private dataFeedsService: DataFeedsService,
    private dataFeedsStorage: DataFeedsStorage) {
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

    this.unMatchList = this.unMatchList.map(item => {
      item.isSelected = isCheckedAll;
      return item;
    });
  }

  onRecordSelect(unMatchRecord: Entity<ClientAsset>) {

    if (unMatchRecord.isSelected)
      unMatchRecord.isSelected = false;
    else
      unMatchRecord.isSelected = true;

    let selectedRecords = this.unMatchList.filter(record => record.isSelected === true);

    if (selectedRecords.length > 0)
      this.isSelectAll = true;
    else {
      this.isSelectAll = false;
    }
  }

  btnImportClick() {
    let list = this.unMatchList.filter(record => record.isSelected === true);

    if (list && list.length > 0) {
      this.runLoading.emit(true);

      this.dataFeedsService.importClientAssetFromMoneySoftToCRM(list, error => {
        if (error) {
          console.log(error);
          this.reloadData(false);
        }
        else {
          if (this.unMatchList.filter(record => record.isSelected === false).length === 0)
            this.uploadAll.emit(true);
          this.isSelectAll = false;
          this.reloadData(true);
        }
      });
    }
  }

  btnIgnoreClick(record?: Entity<ClientAsset>) {
    let list = [];

    if (record) {
      list.push(record);
    }

    else {
      list = this.unMatchList.filter(item => item.isSelected === true);
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

  btnMatchingClick(record: Entity<ClientAsset>) {

    this.resetModal();

    if (record) {
      this.selectedEntity = record;
      this.selectedRecord = record.information;
      this.selectedInstitution = record.information.financialInstitution;

      this.setAutocompleteData(this.selectedRecord.assetType);
    }
  }

  btnSaveClick() {
    let update = this.updateValues();
    // valid selection
    if (update) {
      $('#match-modal').modal('hide');
      this.runLoading.emit(true);

      this.dataFeedsService.updateClientAssetRecord(this.selectedEntity)
        .subscribe(responseCode => {
          if (responseCode === 200) {
            this.isSelectAll = false;
            this.reloadData(true);
          } else if (responseCode === ErrorCode.MANUAL_MATCH_CONFIRM_OVERWRITE) {
            $('#moneysoft-overwrite-warning').modal({
              backdrop: 'static',
            });

            $('#moneysoft-overwrite-warning').modal();

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

      this.dataFeedsService.updateClientAssetRecord(this.selectedEntity, value)
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
    let text = $('#tags').val().trim();
    if (text === "") {
      this.selectedId = undefined;
      this.isSelectAccountName = false;
    }
  }

  /**
   * PRIVATE SECTIONS
   *
   */

  private resetModal() {
    this.selectedEntity = new Entity<ClientAsset>();
    this.selectedRecord = new ClientAsset();
    this.selectedInstitution = new ClientAssetInstitution();
    this.isSelectAccountName = false;
    this.selectedId = undefined;

    $('#tags').val('');
  }

  private setAutocompleteData(type: number) {
    let source: Pairs[] = [];

    // if (!type) return;

    if (type === 1 && this.dataFeedsStorage.assets)
      source = this.dataFeedsStorage.assets;
    if (type === 2 && this.dataFeedsStorage.debts)
      source = this.dataFeedsStorage.debts;
    else if (this.dataFeedsStorage.assets && this.dataFeedsStorage.debts) {
      source = this.combineSources();
    }
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

  private initAutoComplete(records: Pairs[]) {
    if (records.length === 0 || records === undefined) {
      console.log("No source found!!");
      return;
    }

    $("#tags").autocomplete({
      source: (request, response) => {
        let results = $.ui.autocomplete.filter(records, request.term);
        response(results.slice(0, 50));
      },
      select: (e, ui) => {
        this.selectedId = ui.item.id;
        this.isSelectAccountName = true;
      }
    });

    $("#tags").autocomplete("option", "appendTo", "#unGroup");

  }
}
