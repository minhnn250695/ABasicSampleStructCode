import { Injectable } from '@angular/core';
import { DataFeedsService } from "../../data-feeds.service";
import { Pairs } from "../../../revenue-import/models";
import { Observable } from "rxjs/Observable";

@Injectable()
export class ClassManualMatchService {

  constructor(private dataFeedsService: DataFeedsService) { }

  accounts: Pairs[];
  clients: Pairs[];
  clientAssets: Pairs[];
  members: Pairs[];

  getClientMatchStatus(status: any): string {
    if (status == 0) {
      return "Active";
    }
    if (status == 1) {
      return "Cancelled";
    }
    if (status == 2) {
      return "Pending";
    }
    else if (status == 3) {
      return "Suspended";
    }
    else
      return "";
  }

  getClientAssetMatchStatus(status: any) {

  }

  getMemberMatchStatus(status: any) {
  }

  // #region getdata
  getCRMData() {
    this.getCRMClientList();
    this.getCRMClientAccountList();
    this.getCRMClientAssetList();
    this.getCRMMemberList();
  }
  getCRMClientList() {
    if (!this.clients || this.clients.length < 1) {
      this.dataFeedsService.getCRMClientMatch().subscribe((response) => {
        this.clients = response;
        return true;
      });
    }
  }
  getCRMClientAccountList() {
    if (!this.accounts || this.accounts.length < 1)
      this.dataFeedsService.getCRMClientAccountTypeMatch().subscribe((response) => {
        this.accounts = response;
      });
  }

  getCRMClientAssetList() {
    if (!this.clientAssets || this.clientAssets.length < 1)
      this.dataFeedsService.getCRMDataClientAssets().subscribe((response) => {
        this.clientAssets = response;
      });
  }

  getCRMMemberList() {
    if (!this.members || this.members.length < 1)
      this.dataFeedsService.getCRMDataMembers().subscribe((response) => {
        this.members = response;
      });
  }

  getCRMDataById(type: string, id: string) {
    if (id && id !== "00000000-0000-0000-0000-000000000000") {
      if (type == "Account") {
        this.dataFeedsService.getCRMClientAccountById(id).subscribe(res => {
          res.statusString = this.getClientMatchStatus(res.status);
          return res;
        });
      }
      else if (type == "Client") { }
      else if (type == "ClientAsset") { }
      else if (type == "Member") { }
      else
        console.log("Error => ClassManualMatchService => getCRMDataById");
    }
    else
      console.log("Error => ClassManualMatchService => getCRMDataById => Invalid ID");
  }

  // Format date from yyyy/mm/dd or yyyy/mm/ddThh:mm:ss to dd/mm/yyyy
  formatDate(date: string): string {
    if (date.length > 10)
      date = date.substr(0, 10);
    const newDate = date.split('-');
    return newDate[2] + '-' + newDate[1] + '-' + newDate[0];
  }
  // getAccountById(record: any) {
  //   if (record.classFundData && record.classFundData.crmId !== "00000000-0000-0000-0000-000000000000") {
  //     this.dataFeedsService.getCRMClientAccountById(record.classFundData.crmId).subscribe(res => {
  //       record.crm = res;
  //       record.crm.companyTypeString = this.getClientLegalEntityTypeString(record.crm.companyType);
  //     });
  //   }
  //   return record;
  // }
}
