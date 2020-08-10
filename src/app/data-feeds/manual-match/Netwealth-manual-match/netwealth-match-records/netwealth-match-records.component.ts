import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Entity, PlatFormData, ManualMatchModel } from '../../../models';
import { DataFeedsService } from '../../../data-feeds.service';
import { DataFeedsStorage } from '../../../data-feeds-storage.service';
import { Pairs } from '../../../../revenue-import/models/pairs.model';
import { ErrorCode } from '../../../../common/models/error-code.enum';
import { DataFeedsBaseComponent } from '../../../data-feeds-base-components.component';
import { ConfirmationDialogService } from '../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { Router } from '@angular/router';
import { from } from 'rxjs/observable/from';
import { ISubscription } from 'rxjs/Subscription';
declare var $: any;

@Component({
  selector: 'app-netwealth-match',
  templateUrl: './netwealth-match-records.component.html',
  styleUrls: ['./netwealth-match-records.component.css']
})
export class NetwealthMatchComponent extends DataFeedsBaseComponent implements OnInit {

  @Input("matchList") matchList: Entity<PlatFormData>[] = [];
  formUpload: any;
  selectedId: string;
  isSelectAll: boolean = false;
  selectedEntity: Entity<PlatFormData> = new Entity<PlatFormData>();
  selectedRecord: PlatFormData = new PlatFormData();
  isSelectAccountName: boolean = false;
  accountName: string = "";
  style: string = "";
  isDisableSearchBox: boolean;
  isGotAssets: boolean = false;
  selectedAsset: Pairs[];
  constructor(private confirmationDialogService: ConfirmationDialogService,
    private router: Router,
    private _dataFeedsService: DataFeedsService, private _dataFeedsStorage: DataFeedsStorage) {
    super();
  }

  ngOnInit() {
  }

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
        if (item.inImportProgress == false)
          item.isSelected = isCheckedAll;
        return item;
      });
    }
  }

  onRecordSelect(matchRecord: Entity<PlatFormData>) {

    if (matchRecord.isSelected)
      matchRecord.isSelected = false;
    else
      matchRecord.isSelected = true;

    let selectedRecords = this.matchList.filter(record => record.isSelected == true);

    if (selectedRecords.length > 0)
      this.isSelectAll = true;
    else {
      this.isSelectAll = false;
    }
  }

  getClientName(record: PlatFormData) {
    if (record && record.contactCRMFullName) {
      return record.contactCRMFullName;
    }
  }

  btnMatchingClick(record: Entity<PlatFormData>) {
    this.resetModal();

    if (!record.platformData) { return; }
    if (record) {
      this.selectedEntity = record;
      this.selectedRecord = record.platformData;
      if (this._dataFeedsStorage.assets) {
        this.initAutoComplete(this._dataFeedsStorage.assets);
        this.selectedAsset = this._dataFeedsStorage.assets.filter(x => x.id == this.selectedRecord.accountCRMID);
        // get asset name of selected record
        this.accountName = this.selectedAsset.length > 0 ? this.selectedAsset[0].value : "Account Name";
      }
    }
  }

  btnImportClick() {
    let list = this.matchList.filter(record => record.isSelected == true);

    if (list && list.length > 0) {
      this.runLoading.emit(true);
      this._dataFeedsService.importClientAssetToCRM("Netwealth", list).subscribe((res) => {
        this.runLoading.emit(false);
        if (res.success && res.data.code == 200) {
          // goto background
          // show a popup that user can view status at data-import-view
          let subcription: ISubscription = this.confirmationDialogService.showModal({
            title: "Information",
            message: "Importing of records has begun. You can view the status via Import Status menu.",
            btnOkText: "Ok"
          }).subscribe(() => {
            subcription.unsubscribe();
            this.router.navigate(['/']);
          });
        } else if (!res.success && res.error) {
          /* Import error */
          let subcription: ISubscription = this.confirmationDialogService.showModal({
            title: "Error #" + res.error.errorCode,
            message: res.error.errorMessage,
            btnOkText: "Close"
          }).subscribe(() => {
            subcription.unsubscribe();
          });
        }
      }, error => {
        console.log(error);
        /* No Error Code */
        let subcription: ISubscription = this.confirmationDialogService.showModal({
          title: "Warning",
          message: "Service error, please try again.",
          btnOkText: "OK"
        }).subscribe(() => {
          subcription.unsubscribe();
        });
      });


      //#region old api response

      // this._dataFeedsService.importClientAssetToCRM("Netwealth", list, error => {
      //   if (error) {
      //     this.reloadData(false);
      //   }
      //   else {
      //     if (this.matchList.filter(record => record.isSelected == false).length == 0)
      //       this.uploadAll.emit(true);
      //     this.isSelectAll = false;
      //     this.reloadData(true);
      //   }
      // })
      //#endregion
    }
  }

  txtSearchChanged() {
    let text = $('#search-names').val().trim();
    if (text == "") {
      this.selectedId = undefined;
      this.isSelectAccountName = false;
    }
  }

  // getPlaceHolder() {
  //   if (!this._dataFeedsStorage.assets) {
  //     this.accountName = "Loading data...";
  //     this.isDisableSearchBox = true;
  //     this.isGotAssets = false;
  //   }
  //   else if (!this.isGotAssets) { // the first time after we got assets then we need to init auto complete
  //     this.initAutoComplete(this._dataFeedsStorage.assets);
  //     // filter asset with crm from selected record
  //     this.selectedAsset = this._dataFeedsStorage.assets.filter(x => x.id == this.selectedRecord.accountCRMID);
  //     this.accountName = this.selectedAsset.length > 0 ? this.selectedAsset[0].value : "Account Name";
  //     this.isDisableSearchBox = false;
  //     this.isGotAssets = true;
  //   }
  //   return this.accountName;
  // }

  getPlaceHolder() {
    if (this._dataFeedsStorage.assets) {
      this.selectedAsset = this._dataFeedsStorage.assets.filter(x => x.id == this.selectedRecord.accountCRMID);
    }
    if (this.selectedAsset)
      this.accountName = this.selectedAsset.length > 0 ? this.selectedAsset[0].value : "Account Name";
    return this.accountName;
  }

  btnSaveClick() {
    let update = this.updateValues();

    // valid selection
    if (update) {
      $('#netwealth-matched-modal').modal('hide');
      this.runLoading.emit(true);

      this.formUpload = this.createUpdateForm(this.selectedEntity);
      this._dataFeedsService.updateMatchedRecords(this.formUpload)
        .subscribe(responseCode => {
          if (responseCode == 200) {
            this.isSelectAll = false;
            this.reloadData(true);
          }
          else if (responseCode == ErrorCode.MANUAL_MATCH_CONFIRM_OVERWRITE) {
            $('#overwrite-match-warning').modal({
              backdrop: 'static',
            });
            $('#overwrite-match-warning').modal("show");
            this.reloadData(false);
          }
          else {
            console.log("error")
            this.reloadData(false);
          }
        });
    }
  }

  /**
  *  PRIVATE SECTIONS
  * 
  */

  private initAutoComplete(records: Pairs[]) {
    if (records.length == 0 || records == undefined) {
      console.log("No source found!!")
      return;
    }
    let self = this;
    $("#search-names").autocomplete({
      source: function (request, response) {
        var results = $.ui.autocomplete.filter(records, request.term);
        response(results.slice(0, 50));
      },
      select: function (e, ui) {
        self.selectedId = ui.item.id;
        self.isSelectAccountName = true;
      }
    });
    $("#search-names").autocomplete("option", "appendTo", "#search-group");

  }

  btnYesClick(value: number) {
    if (value) {
      this.runLoading.emit(true);
      // update overwrite option
      this.formUpload.OverwriteOption = value;
      this._dataFeedsService.updateMatchedRecords(this.formUpload)
        .subscribe(responseCode => {
          if (responseCode == 200) {
            this.isSelectAll = false;
            this.formUpload = undefined;
            this.reloadData(true);
          }
          else
            console.log("error")
        });
    }
  }

  private createUpdateForm(entity: Entity<PlatFormData>, option?: number): ManualMatchModel {
    if (!entity) return;
    let form: ManualMatchModel = {
      providerName: entity.providerName,
      entityName: entity.entityName,
      externalId: entity.externalId,
      crmId: entity.platformData.accountCRMID,
      overwriteOption: option
    }
    return form;
  }

  private updateValues(): boolean {
    let selected = this.getSelectedValue();
    if (selected) {
      // update info
      this.selectedEntity.platformData.accountCRMID = selected.id;
      return true;
    }
    return false;
  }

  private getSelectedValue(): Pairs {
    let value = this.selectedId;
    if (!value) return null;
    let record = this._dataFeedsStorage.assets.find(x => x.id == value);
    if (record)
      return record;
    return null;
  }

  private resetModal() {
    this.selectedEntity = new Entity<PlatFormData>();
    this.selectedRecord = new PlatFormData();
    this.isSelectAccountName = false;
    this.selectedId = undefined;
    $('#search-names').val('');
  }
}