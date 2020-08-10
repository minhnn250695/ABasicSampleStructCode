import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
import { ErrorCode } from '../../../../client-view/client-debt/models';
import { ConfirmationDialogService } from '../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { Pairs } from '../../../../revenue-import/models/pairs.model';
import { DataFeedsBaseComponent } from '../../../data-feeds-base-components.component';
import { DataFeedsStorage } from '../../../data-feeds-storage.service';
import { DataFeedsService } from '../../../data-feeds.service';
import { Entity, ManualMatchModel, PlatFormData } from '../../../models';

declare var $: any;
@Component({
  selector: 'app-desktop-broker-match',
  templateUrl: './desktop-broker-match.component.html',
  styleUrls: ['./desktop-broker-match.component.css']
})
export class DesktopBrokerMatchComponent extends DataFeedsBaseComponent implements OnInit {

  //#region Properties
  @Input('matchList') matchList: Array<Entity<PlatFormData>> = [];

  formUpload: any;
  selectedId: string;
  isSelectAll = false;
  selectedEntity: Entity<PlatFormData> = new Entity<PlatFormData>();
  selectedRecord: PlatFormData = new PlatFormData();
  isSelectAccountName = false;
  accountName = '';
  style = '';
  isDisableSearchBox: boolean;
  isGotAssets = false;
  selectedAsset: Pairs[];
  //#endregion

  //#region Constructors
  constructor(
    private router: Router,
    private dataFeedsService: DataFeedsService,
    private confirmationDialogService: ConfirmationDialogService,
    private dataFeedsStorage: DataFeedsStorage
  ) {
    super();
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.onRecordSelectAll(false);
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('body').removeAttr("style");
  }
  //#endregion

  //#region Actions

  //#region Views handlers
  txtSearchChanged() {
    const text = $('#search-names').val().trim();
    if (text === '') {
      this.selectedId = undefined;
      this.isSelectAccountName = false;
    }
  }

  getClientName(record: PlatFormData) {
    if (record && record.contactCRMFullName) {
      return record.contactCRMFullName;
    }
  }

  getPlaceHolder() {
    if (this.dataFeedsStorage.assets) {
      this.selectedAsset = this.dataFeedsStorage.assets.filter(x => x.id === this.selectedRecord.accountCRMID);
    }
    if (this.selectedAsset)
      this.accountName = this.selectedAsset.length > 0 ? this.selectedAsset[0].value : 'Account Name';
    return this.accountName;
  }

  //#endregion

  //#region Tickbox
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

    const selectedRecords = this.matchList.filter(record => record.isSelected === true);

    if (selectedRecords.length > 0)
      this.isSelectAll = true;
    else {
      this.isSelectAll = false;
    }
  }
  //#endregion

  //#region Button handlers
  btnMatchingClick(record: Entity<PlatFormData>) {
    this.resetModal();
    if (!record.platformData) { return; }
    if (record) {
      this.selectedEntity = record;
      this.selectedRecord = record.platformData;

      if (this.dataFeedsStorage.assets) {
        this.initAutoComplete(this.dataFeedsStorage.assets);
        // filter asset with crm from selected record
        this.selectedAsset = this.dataFeedsStorage.assets.filter(x => x.id === this.selectedRecord.accountCRMID);
        this.accountName = this.selectedAsset.length > 0 ? this.selectedAsset[0].value : 'Account Name';
      }
    }
  }

  btnImportClick() {
    const list = this.matchList.filter(record => record.isSelected === true);

    if (list && list.length > 0) {
      this.runLoading.emit(true);

      this.dataFeedsService.importClientAssetToCRM('DesktopBroker', list).subscribe((res) => {
        this.runLoading.emit(false);
        if (res.success && res.data.code === 200) {
          // goto background
          // show a popup that user can view status at data-import-view
          const subcription: ISubscription = this.confirmationDialogService.showModal({
            title: 'Information',
            message: 'Importing of records has begun. You can view the status via Import Status menu.',
            btnOkText: 'Ok'
          }).subscribe(() => {
            subcription.unsubscribe();
            this.router.navigate(['/']);
          });
        } else if (!res.success && res.error) {
          console.log('Import error', res.error);
          /* Import error */
          const subcription: ISubscription = this.confirmationDialogService.showModal({
            title: 'Error #' + res.error.errorCode,
            message: res.error.errorMessage,
            btnOkText: 'Close'
          }).subscribe(() => {
            subcription.unsubscribe();
          });
        }
      }, error => {
        console.log('Import error', error);
        /* No Error Code */
        const subcription: ISubscription = this.confirmationDialogService.showModal({
          title: 'Error',
          message: 'Internal service error.',
          btnOkText: 'Close'
        }).subscribe(() => {
          subcription.unsubscribe();
        });
      });
    }
  }

  btnSaveClick() {
    const update = this.updateValues();

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
          // tslint:disable-next-line:one-line
          else if (responseCode === ErrorCode.MANUAL_MATCH_CONFIRM_OVERWRITE) {
            $('#overwrite-match-warning').modal({
              backdrop: 'static',
            });
            $('#overwrite-match-warning').modal('show');
            this.reloadData(false);
          }
          else {
            console.log('error');
            this.reloadData(false);
          }
        });
    }
  }

  btnYesClick(value: number) {

    /** Note: Currently if it is not overwrite => do not call api */
    if (value === 1) {// yes => overwrite
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
            console.log('error');
        });
    }
  }
  //#endregion

  //#endregion

  //#region Private
  private initAutoComplete(records: Pairs[]) {
    if (records.length === 0 || records === undefined) {
      console.log('No source found!!');
      return;
    }

    $('#search-names').autocomplete({
      source: (request, response) => {
        const results = $.ui.autocomplete.filter(records, request.term);
        response(results.slice(0, 50));
      },
      select: (e, ui) => {
        this.selectedId = ui.item.id;
        this.isSelectAccountName = true;
      }
    });
    $('#search-names').autocomplete('option', 'appendTo', '#search-group');

  }

  private createUpdateForm(entity: Entity<PlatFormData>, option?: number): ManualMatchModel {
    if (!entity) return;
    const form: ManualMatchModel = {
      providerName: entity.providerName,
      entityName: entity.entityName,
      externalId: entity.externalId,
      crmId: entity.platformData.accountCRMID,
      overwriteOption: option
    };
    return form;
  }

  private updateValues(): boolean {
    const selected = this.getSelectedValue();
    if (selected) {
      // update info
      this.selectedEntity.platformData.accountCRMID = selected.id;
      return true;
    }
    return false;
  }

  private getSelectedValue(): Pairs {
    const value = this.selectedId;
    if (!value) return null;
    const record = this.dataFeedsStorage.assets.find(x => x.id === value);
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
  //#endregion

}