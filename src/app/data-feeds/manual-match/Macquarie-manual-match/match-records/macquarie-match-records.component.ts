import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { from } from 'rxjs/observable/from';
import { ISubscription } from 'rxjs/Subscription';
import { ConfirmationDialogService } from '../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { ErrorCode } from '../../../../common/models/error-code.enum';
import { Pairs } from '../../../../revenue-import/models/pairs.model';
import { DataFeedsBaseComponent } from '../../../data-feeds-base-components.component';
import { DataFeedsStorage } from '../../../data-feeds-storage.service';
import { DataFeedsService } from '../../../data-feeds.service';
import { ClientAsset, ClientAssetInstitution, Entity, ManualMatchModel, PlatFormData, Provider } from '../../../models';
declare var $: any;

@Component({
  selector: 'app-macquarie-match',
  templateUrl: './macquarie-match-records.component.html',
  styleUrls: ['./macquarie-match-records.component.css']
})
export class MacquarieMatchComponent extends DataFeedsBaseComponent implements OnInit {

  @Input("matchList") matchList: Array<Entity<PlatFormData>> = [];
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
  constructor(
    private router: Router,
    private dataFeedsService: DataFeedsService,
    private confirmationDialogService: ConfirmationDialogService,
    private dataFeedsStorage: DataFeedsStorage
  ) {
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
        if (item.inImportProgress === false)
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

    let selectedRecords = this.matchList.filter(record => record.isSelected === true);

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

      // let searchGroup: any = document.getElementById('search-group');
      // let a = this.getPlaceHolder();
      // searchGroup.placeholder = a;

      if (this.dataFeedsStorage.assets) {
        this.initAutoComplete(this.dataFeedsStorage.assets);
        // filter asset with crm from selected record
        this.selectedAsset = this.dataFeedsStorage.assets.filter(x => x.id === this.selectedRecord.accountCRMID);
        this.accountName = this.selectedAsset.length > 0 ? this.selectedAsset[0].value : "Account Name";
      }
    }
  }

  btnImportClick() {
    let list = this.matchList.filter(record => record.isSelected === true);

    if (list && list.length > 0) {
      this.runLoading.emit(true);
      this.dataFeedsService.importClientAssetToCRM("Macquarie", list).subscribe((res) => {
        this.runLoading.emit(false);
        if (res.success && res.data.code === 200) {
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
        /* No Error Code */
        let subcription: ISubscription = this.confirmationDialogService.showModal({
          title: "Error",
          message: "Internal service error.",
          btnOkText: "Close"
        }).subscribe(() => {
          subcription.unsubscribe();
        });
      });
    }
  }

  getPlaceHolder() {
    if (this.dataFeedsStorage.assets) {
      this.selectedAsset = this.dataFeedsStorage.assets.filter(x => x.id === this.selectedRecord.accountCRMID);
    }
    if (this.selectedAsset)
      this.accountName = this.selectedAsset.length > 0 ? this.selectedAsset[0].value : "Account Name";
    return this.accountName;
  }

  txtSearchChanged() {
    let text = $('#search-names').val().trim();
    if (text === "") {
      this.selectedId = undefined;
      this.isSelectAccountName = false;
    }
  }

  btnSaveClick() {
    let update = this.updateValues();

    // valid selection
    if (update) {
      $('#ca-matched-modal').modal('hide');
      this.runLoading.emit(true);

      this.formUpload = this.createUpdateForm(this.selectedEntity);
      this.dataFeedsService.updateMatchedRecords(this.formUpload)
        .subscribe(responseCode => {
          if (responseCode === 200) {
            this.isSelectAll = false;
            this.reloadData(true);
          }
          else if (responseCode === ErrorCode.MANUAL_MATCH_CONFIRM_OVERWRITE) {
            $('#overwrite-match-warning').modal({
              backdrop: 'static',
            });
            $('#overwrite-match-warning').modal("show");
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
      // update overwrite option
      this.formUpload.OverwriteOption = value;
      this.dataFeedsService.updateMatchedRecords(this.formUpload)
        .subscribe(responseCode => {
          if (responseCode === 200) {
            this.isSelectAll = false;
            this.formUpload = undefined;
            this.reloadData(true);
          }
          else
            console.log("error");
        });
    }
  }

  /**
   *  PRIVATE SECTIONS
   *
   */

  private initAutoComplete(records: Pairs[]) {
    if (records.length === 0 || records === undefined) {
      console.log("No source found!!");
      return;
    }

    $("#search-names").autocomplete({
      source: (request, response) => {
        let results = $.ui.autocomplete.filter(records, request.term);
        response(results.slice(0, 50));
      },
      select: (e, ui) => {
        this.selectedId = ui.item.id;
        this.isSelectAccountName = true;
      }
    });
    $("#search-names").autocomplete("option", "appendTo", "#search-group");

  }

  private createUpdateForm(entity: Entity<PlatFormData>, option?: number): ManualMatchModel {
    if (!entity) return;
    let form: ManualMatchModel = {
      providerName: entity.providerName,
      entityName: entity.entityName,
      externalId: entity.externalId,
      crmId: entity.platformData.accountCRMID,
      overwriteOption: option
    };
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
    let record = this.dataFeedsStorage.assets.find(x => x.id === value);
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