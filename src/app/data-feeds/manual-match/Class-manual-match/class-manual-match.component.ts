import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs/Observable";
import { DataFeedsBaseComponent } from "../../data-feeds-base-components.component";
import { DataFeedsStorage } from "../../data-feeds-storage.service";
import { DataFeedsService } from "../../data-feeds.service";
import { ClassManualMatchService } from "./class-manual-match.service";
import { Entity, PlatFormData, PersonalDetail, ClassFundData, ClassManualMatch, Member } from "../../models";
import { any } from '@uirouter/core';
import { CurrentActionComponent } from '../../../client-view/advice-builder/advice-strategy-details/current-action/current-action.component';

declare var $: any;
@Component({
  selector: "app-class-manual-match",
  templateUrl: "./class-manual-match.component.html",
  styleUrls: ["./class-manual-match.component.css"],
})
export class ClassManualMatchComponent extends DataFeedsBaseComponent implements OnInit {

  //#region Properties
  activeUnmatchedTab: boolean = false;
  contentTabCSS: string = "in active";
  loadingData: boolean = false;

  manualMatchList: ClassManualMatch = new ClassManualMatch();
  manualUnMatchList: ClassManualMatch = new ClassManualMatch();
  manualIgnoredList: ClassManualMatch = new ClassManualMatch();


  manualMatchType: any;
  manualMatchTypeDetails: any;
  manualMatchTypeList: any;

  private isUploadAll: boolean = false;
  //#endregion

  //#region Constructors
  constructor(
    private dataFeedsStorage: DataFeedsStorage,
    private dataFeedsService: DataFeedsService,
    private classManualMatchService: ClassManualMatchService,
    private router: Router,
    private activatedRouter: ActivatedRoute) {
    super();
  }

  ngOnInit() {
    // get link params
    this.initialTabCss();
    this.initialData();
    this.runLoading.emit(true);

    // get data asset
    // this.dataFeedsService.getAssets().subscribe((res) => {
    //   this.runLoading.emit(false);
    //   if (res) {
    //     this.dataFeedsStorage.assets = res;
    //   }
    // });
  }

  ngOnDestroy() {
    // super.showLoading(false);
    this.dataFeedsService.hideLoading()
    $("#confirm-import").modal("hide");
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
  }
  //#endregion

  //#region Actions
  /**
   * Reload data when update success
   */
  reloadData(event: boolean) {
    if (event) {
      this.initialData();
    }
    else
      // this.loading.closeSpinner();
      this.dataFeedsService.hideLoading()
  }

  openLoading(event: boolean) {
    if (event) {
      // this.loading.openSpinner();
      this.dataFeedsService.showLoading()
    } else
      // this.loading.closeSpinner();
      this.dataFeedsService.hideLoading()
  }

  gotoHomePage() {
    this.router.navigate(["/data-feeds/home-feeds"]);
  }

  checkUploadAll(event: boolean) {
    if (event)
      this.isUploadAll = true;
  }

  onChangeRecordType() {
    this.manualMatchTypeDetails = this.getManualMatchTypeObj(this.manualMatchType);
    const listName = this.manualMatchTypeDetails.value;
    if (!this.manualMatchList[listName] || this.manualMatchList[listName].length < 1) {
      const func = "get" + listName + "List";
      if (listName != "Client")
        this[func]({ Provider: "Class", EntityName: listName });
      else
        this[func];
    }
  }
  //#endregion

  //#region Private
  private initialTabCss() {
    if (sessionStorage.getItem("isUnmatched") === "true") {
      this.activeUnmatchedTab = true;
      // remove it from sessionStorage
      sessionStorage.removeItem("isUnmatched");
    }
    else this.activeUnmatchedTab = false;
  }

  getClientList() {
    var providerClient = { Provider: "Class", EntityName: "Client" };
    var providerAccount = { Provider: "Class", EntityName: "Account" };
    if ((providerClient && providerClient.Provider != null) && (providerAccount && providerAccount.Provider != null)) {
      this.loadingData = true;
      Observable.zip(this.dataFeedsService.getClientMatchedList(providerAccount),
        this.dataFeedsService.getClientUnMatchedList(providerAccount),
        this.dataFeedsService.getClientMatchedList(providerClient),
        this.dataFeedsService.getClientUnMatchedList(providerClient))
        .subscribe((response) => {
          this.processGetClientList(response);
          this.loadingData = false;
        });
    }
    else {
      // this.loading.closeImmediate();
      this.dataFeedsService.hideLoading()
      this.gotoHomePage();
    }
  }

  getClientAssetList(provider: any) {
    if (provider && provider.Provider != null) {
      this.loadingData = true;
      Observable.zip(this.dataFeedsService.getClientAssetMatchedList(provider),
        this.dataFeedsService.getClientAssetUnMatchedList(provider),
        this.dataFeedsService.getClientAssetIgnoredRecords(provider.Provider))
        .subscribe((response) => {
          this.processgetList("ClientAsset", response);
          this.loadingData = false;
        });
    }
    else {
      // this.loading.closeImmediate();
      this.dataFeedsService.hideLoading()
      this.gotoHomePage();
    }
  }

  getMemberList(provider: any) {
    if (provider && provider.Provider != null) {
      this.loadingData = true;
      Observable.zip(this.dataFeedsService.getClientMatchedList(provider),
        this.dataFeedsService.getClientUnMatchedList(provider))
        .subscribe((response) => {
          this.processgetList("Member", response);
          this.loadingData = false;
        });
    }
    else {
      // this.loading.closeImmediate();
      this.dataFeedsService.hideLoading()
      this.gotoHomePage();
    }
  }

  getCRMDataById(type: string) {
    const manualMatch = [this.manualMatchList[type], this.manualUnMatchList[type]];
    for (var i = 0; i < manualMatch.length; i++) {
      var list = manualMatch[i];
      if (list.length > 0) {
        for (var x = 0; x < list.length; x++) {
          if (type == "Client")
            this.getCRMClientById(list[x]);
          else if (type == "ClientAsset")
            this.getCRMClientAssetById(list[x]);
          else if (type == "Member")
            this.getCRMMemberById(list[x]);
        }
      }
    }
  }

  getCRMClientById(record: Entity<ClassFundData>) {
    if (record.entityName == "Account") {
      if (record.classFundData && record.classFundData.crmId && record.classFundData.crmId !== "00000000-0000-0000-0000-000000000000") {
        this.dataFeedsService.getCRMClientAccountById(record.classFundData.crmId).subscribe(res => {
          if (res) {
            record.classFundData.crm = res;
            record.classFundData.crm.statusText = this.classManualMatchService.getClientMatchStatus(res.status);
          }
        });
      }
    }
    else if (record.entityName == "Client") {
      if (record.classFundData && record.classFundData.crmId && record.classFundData.crmId !== "00000000-0000-0000-0000-000000000000") {
        this.dataFeedsService.getCRMClientById(record.classFundData.crmId).subscribe(res => {
          if (res) {
            record.classFundData.crm = res;
            record.classFundData.crm.statusText = this.classManualMatchService.getClientMatchStatus(res.status);
          }
        });
      }
    }
  }

  getCRMClientAssetById(record: any) {
    if (record.platformData && record.platformData.accountCRMID && record.platformData.accountCRMID !== "00000000-0000-0000-0000-000000000000") {
      this.dataFeedsService.getCRMClientAssetById(record.platformData.accountCRMID).subscribe(res => {
        record.platformData.accountCRM = res;
      });
    }
  }

  getCRMMemberById(record: any) {
    if (record.member && record.member.memberCRMId && record.member.memberCRMId !== "00000000-0000-0000-0000-000000000000") {
      // var members = { memberID: record.member.memberCRMId };
      this.dataFeedsService.getCRMMemberById(record.member.memberCRMId).subscribe(res => {
        if (res)
          record.member.memberCRM = res;
      });
    }
  }

  processGetClientList(response: any) {
    this.dataFeedsService.hideLoading()
    this.dataFeedsService.isSelectedDateChanged = false;
    this.manualMatchList.Client = response[0].concat(response[2]);
    this.manualUnMatchList.Client = response[1].concat(response[3]);
    this.manualIgnoredList.Client = [];
    // this.getCRMDataById("Client");
  }

  processgetList(type: string, response: any) {
    this.dataFeedsService.hideLoading()
    this.dataFeedsService.isSelectedDateChanged = false;
    this.manualMatchList[type] = response[0];
    this.manualUnMatchList[type] = response[1];
    this.manualIgnoredList[type] = [];
    if(type == "Member"){
      this.modifyMemberList(this.manualMatchList.Member);
      this.modifyMemberList(this.manualUnMatchList.Member);
    }
    if(type == "ClientAsset") {
      this.manualIgnoredList.ClientAsset = response[2];
    }
  }

  private modifyMemberList(list: any) {
    if(list.length > 0) {
      list.forEach(item => {
        if(item.member && item.member.personalDetails)
          item.member.personalDetails.birthDate = item.member.personalDetails.dateOfBirth != "" ? this.classManualMatchService.formatDate(item.member.personalDetails.dateOfBirth) : "";
        else
          console.log("Error => ClassManualMatch => modifyMemberList");
      });
    }
  }

  private initialData() {
    this.classManualMatchService.getCRMData();
    this.initialManualMatchType();
    this.getClientList();
    // this.getClientAssetList({ Provider: "Class", EntityName: "ClientAsset" });
    // this.getMemberList({ Provider: "Class", EntityName: "Member" });
  }

  private initialManualMatchType() {
    this.manualMatchList = new ClassManualMatch();
    this.manualUnMatchList = new ClassManualMatch();
    this.manualIgnoredList = new ClassManualMatch();
    this.manualMatchTypeList = [
      { name: "Company / Contact", displayValue: "Client", value: "Client", list: "Client", data: "classFundData", crmId: "crmId" },
      { name: "Client Asset", displayValue: "Client Asset", value: "ClientAsset", list: "ClientAsset", data: "platformData", crmId: "accountCRMID" },
      { name: "Member", displayValue: "Member", value: "Member", list: "Member", data: "member", crmId: "memberCRMId" }
    ];
    this.manualMatchType = "Client";
    this.manualMatchTypeDetails = this.getManualMatchTypeObj(this.manualMatchType);
  }

  getDataBaseOnType(list: any) {
    return list[this.manualMatchTypeDetails.value];
  }

  getNumberOfRecords(list: any) {
    if (this.manualMatchType == "Client")
      return list.Client ? list.Client.length : 0;
    else if (this.manualMatchType == "ClientAsset")
      return list.ClientAsset ? list.ClientAsset.length : 0;
    else if (this.manualMatchType == "Member")
      return list.Member ? list.Member.length : 0;
    else
      console.log("Error on get data");
  }

  getManualMatchTypeObj(type) {
    const obj = this.manualMatchTypeList.filter(list => list.value == type);
    if (obj && obj.length > 0)
      return obj[0];
  }

  //#endregion

}
