import { Component, Input, OnInit } from "@angular/core";
import { ErrorCode } from "../../../../client-view/client-debt/models";
import { ConfirmationDialogService } from "../../../../common/dialog/confirmation-dialog/confirmation-dialog.service";
import { Pairs } from "../../../../revenue-import/models";
import { DataFeedsBaseComponent } from "../../../data-feeds-base-components.component";
import { DataFeedsStorage } from "../../../data-feeds-storage.service";
import { DataFeedsService } from "../../../data-feeds.service";
import { Entity, ManualMatchModel, PlatFormData, ClassFundData, Member } from '../../../models';
import { ClassManualMatchService } from '../class-manual-match.service';
import { any } from '@uirouter/angular';

declare var $: any;
@Component({
  selector: "app-class-unmatch",
  styleUrls: ["./class-unmatch.component.css"],
  templateUrl: "./class-unmatch.component.html",
})
export class ClassUnmatchComponent extends DataFeedsBaseComponent implements OnInit {

  //#region Properties
  @Input("unMatchList") unMatchList: any;
  @Input("manualMatchType") manualMatchType: any;
  // @Input('loadingData') loadingData: any;

  warningMess = "";
  selectedId: string;
  isSearching: boolean = false;
  isSelectAll = false;
  selectedEntity: Entity<any> = new Entity<any>();
  selectedClientRecord: ClassFundData = new ClassFundData();
  selectedClientAssetRecord: PlatFormData = new PlatFormData();
  selectedMemberRecord: Member = new Member();
  isValidtoSave = false;
  formUpload: any;
  //#endregion

  //#region Constructors
  constructor(
    private dataFeedsService: DataFeedsService,
    private dataFeedsStorage: DataFeedsStorage,
    private confirmationDialogService: ConfirmationDialogService,
    private classManualMatchService: ClassManualMatchService) {
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
  //#endregion

  //#region Actions

  //#region View handlers
  txtSearchChanged() {
    const text = $('#class-unmatched-search').val().trim();
    if (text === '') {
      this.selectedId = undefined;
    }
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

  checkRecordSelectAll(): boolean {
    const selectedRecords = this.unMatchList.filter(record => record.isSelected === true);
    return selectedRecords.length > 0 ? true : false;
  }

  onRecordSelect(unMatchRecord: any) {
    unMatchRecord.isSelected = unMatchRecord.isSelected ? false : true;
    const selectedRecords = this.unMatchList.filter(record => record.isSelected === true);
    this.isSelectAll = selectedRecords.length > 0 ? true : false;
  }
  //#endregion

  //#region Button handlers

  btnRefreshCRM(record: any, index: any) {
    document.getElementById('btnUnmatched' + index).classList.add("fa-spin");
    const type = record.entityName == "Account" ? "ClientAccount" : record.entityName;
    const func = "getCRM" + type + "List";

    this.refreshCRMData(this.manualMatchType);

    this.classManualMatchService[func];
    setTimeout(() => {
      document.getElementById('btnUnmatched' + index).classList.remove("fa-spin");
    }, 3000);
  }

  btnMatchingClick(record: any) {
    if (this.manualMatchType.value === 'Client')
      this.proceedClientMatchingClick(record);
    else if (this.manualMatchType.value === 'ClientAsset')
      this.proceedClientAssetMatchingClick(record);
    else if (this.manualMatchType.value === 'Member')
      this.proceedMemberMatchingClick(record);
    else
      console.log("Error => Matched => btnMatchingClick");
  }

  proceedClientMatchingClick(record: Entity<ClassFundData>) {
    this.resetModal();
    if (!record.classFundData) { return; }
    if (record) {
      this.selectedEntity = record;
      this.selectedClientRecord = record.classFundData;

      const func = "get" + record.entityName + "ById";
      this[func](this.selectedClientRecord, this.selectedClientRecord.crmId);

      if (record.entityName == "Account" && this.classManualMatchService.accounts) {
        this.initAutoComplete("Account", this.classManualMatchService.accounts);
      }
      else if (record.entityName == "Client" && this.classManualMatchService.clients) {
        this.initAutoComplete("Client", this.classManualMatchService.clients);
      }
    }
  }

  proceedClientAssetMatchingClick(record: any) {
    this.resetModal();
    if (!record.platformData) { return; }
    if (record) {
      this.selectedEntity = record;
      this.selectedClientAssetRecord = record.platformData;
      this.getClientAssetById(this.selectedClientAssetRecord, this.selectedClientAssetRecord.accountCRMID);
    }

    if (this.classManualMatchService.clientAssets) {
      this.initAutoComplete("ClientAsset", this.classManualMatchService.clientAssets);
    }
  }

  proceedMemberMatchingClick(record: any) {
    this.resetModal();
    if (!record.member) { return; }
    if (record) {
      this.selectedEntity = record;
      this.selectedMemberRecord = record.member;
      this.getMemberById(this.selectedMemberRecord, this.selectedMemberRecord.memberCRMId);
    }
    if (this.classManualMatchService.members) {
      this.initAutoComplete("Member", this.classManualMatchService.members);
    }
  }

  btnSaveClick() {
    const update = this.updateValues();
    // valid selection
    if (update) {
      $('#class-unmatched-modal').modal('hide');
      this.runLoading.emit(true);

      this.formUpload = this.createUpdateForm(this.selectedEntity);
      this.dataFeedsService.updateClassManualMatchRecord(this.formUpload, false)
        .subscribe(responseCode => {
          if (responseCode === 200) {
            this.isSelectAll = false;
            this.reloadData(true);
          }
          // tslint:disable-next-line:one-line
          else if (responseCode === ErrorCode.MANUAL_MATCH_CONFIRM_OVERWRITE) {
            $('#overwrite-unmatch-warning').modal({
              backdrop: 'static',
            });
            $('#overwrite-unmatch-warning').modal('show');
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
      this.formUpload.overwriteOption = value ? value : 0;
      this.dataFeedsService.updateClassManualMatchRecord(this.formUpload, false)
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

  btnIgnoreMatch(record: any) {
    let list = [];

    if (record) {
      list.push(record);
    }
    else {
      list = this.unMatchList.filter(item => item.isSelected === true);
    }

    if (list.length > 0) {
      this.runLoading.emit(true);

      this.dataFeedsService.addClientAssetIgnoredRecords("Class", list, error => {
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
  //#endregion

  //#endregion

  //#region Private
  private initAutoComplete(type: string, records: Pairs[]) {
    if (records.length === 0 || records === undefined) {
      console.log('No source found!!');
      return;
    }

    $('#class-unmatched-search').autocomplete({
      source: (request, response) => {
        const results = $.ui.autocomplete.filter(records, request.term);
        response(results.slice(0, 50));
      },
      select: (e, ui) => {
        this.selectedId = ui.item.id;
        const func = "get" + type + "ById";
        const recordType = type == "Account" || type == "Client" ? "Client" : type;
        const record = "selected" + recordType + "Record";
        this[func](this[record], ui.item.id);

        if (this[record][this.manualMatchType.crmId] != ui.item.id)
          this.isValidtoSave = true;
        else
          this.isValidtoSave = false;
      }
    });
    $('#class-unmatched-search').autocomplete('option', 'appendTo', '#search-group-unmatched');
  }

  private getAccountById(record: ClassFundData, id: string) {
    this.isSearching = true;
    this.dataFeedsService.getCRMClientAccountById(id).subscribe(res => {
      record.crm = res;
      record.crm.statusText = this.classManualMatchService.getClientMatchStatus(res.status);
      this.isSearching = false;
    });
  }

  private getClientById(record: ClassFundData, id: string) {
    this.isSearching = true;
    this.dataFeedsService.getCRMClientById(id).subscribe(res => {
      record.crm = res;
      record.crm.companyName = res.fullName;
      record.crm.companyTypeText = "Personal";
      record.crm.statusText = this.classManualMatchService.getClientMatchStatus(res.status);
      this.isSearching = false;
    });
  }

  private getClientAssetById(record: any, id: string) {
    this.isSearching = true;
    this.dataFeedsService.getCRMClientAssetById(id).subscribe(res => {
      record.accountCRM = res;
      this.isSearching = false;
    });
  }

  private getMemberById(record: any, id: string) {
    this.isSearching = true;
    this.dataFeedsService.getCRMMemberById(id).subscribe(res => {
      record.memberCRM = res;
      record.memberCRM.crmBirthDateDisplayValue = record.memberCRM.crmBirthDate != undefined && record.memberCRM.crmBirthDate != "" ? this.classManualMatchService.formatDate(record.memberCRM.crmBirthDate) : "";
      this.isSearching = false;
    });
  }


  private createUpdateForm(entity: any, option?: number): ManualMatchModel {
    if (!entity) return;
    const form: ManualMatchModel = {
      providerName: entity.providerName,
      entityName: entity.entityName,
      externalId: entity.externalId,
      crmId: entity[this.manualMatchType.data][this.manualMatchType.crmId],
      overwriteOption: option
    };
    return form;
  }

  private updateValues(): boolean {
    const selected = this.getSelectedValue();
    if (selected) {
      // update info
      this.selectedEntity[this.manualMatchType.data][this.manualMatchType.crmId] = selected.id;
      return true;
    }
    return false;
  }

  private getSelectedValue(): Pairs {
    const value = this.selectedId;
    if (!value) return null;
    var asset = this.selectedEntity.entityName.toLocaleLowerCase() + 's';
    if (asset == "clientassets")
      asset = "clientAssets";
    const record = this.classManualMatchService[asset].find(x => x.id === value);
    if (record)
      return record;
    return null;
  }

  private resetModal() {
    this.selectedEntity = new Entity<any>();
    this.selectedClientRecord = new ClassFundData();
    this.selectedClientAssetRecord = new PlatFormData();
    this.selectedMemberRecord = new Member();
    this.selectedId = undefined;
    this.isSearching = false;
    $('#class-unmatched-search').val('');
  }

  private refreshCRMData(type: any) {
    switch (type.value) {
      case "Client": {
        this.classManualMatchService.clients = [];
        this.classManualMatchService.getCRMClientList();

        this.classManualMatchService.accounts = [];
        this.classManualMatchService.getCRMClientAccountList();
      } break;
      case "ClientAsset": {
        this.classManualMatchService.clientAssets = [];
        this.classManualMatchService.getCRMClientAssetList();
      } break;
      case "Member": {
        this.classManualMatchService.members = [];
        this.classManualMatchService.getCRMMemberList();
      } break;
    }

  }
  //#endregion

}
