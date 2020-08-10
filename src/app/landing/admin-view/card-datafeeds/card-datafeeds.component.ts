import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from '../../../../../node_modules/rxjs';
import { LoaderService } from '../../../common/modules/loader';
import { DataFeedsService } from '../../../data-feeds/data-feeds.service';
import { RESTConnection, ThirdParty, ThirdPartyDataFeedSettings, ThirdPartyInfo } from '../../../third-party/models';
import { ThirdPartyService } from '../../../third-party/third-party.service';
import { DataFeedsObject, ExpiredCompany } from './models';
import { ISubscription } from 'rxjs/Subscription';

@Component({
  selector: 'card-datafeeds',
  templateUrl: './card-datafeeds.component.html',
  styleUrls: ['./card-datafeeds.component.css'],
})
export class CardDatafeedsComponent implements OnInit {

  thirdParties: any[] = [];
  expiredCompanies: ExpiredCompany[] = [];

  private imported: DataFeedsObject[];
  private matched: DataFeedsObject[];
  private unmatched: DataFeedsObject[];
  private validCompanies: string[] = [];
  private iSub: ISubscription;
  constructor(private router: Router,
    private dataFeedsService: DataFeedsService,
    private loaderService: LoaderService,
    private thirdPartyService: ThirdPartyService) { }

  ngOnInit() {
    this.getAllData();
    this.getAllThirdParties();
  }

  ngOnDestroy() {
    this.loaderService.hide();
  }

  /**
   * Get total valid records depends on which type
   *
   * type = 1: matched
   * type = 2: unmatched
   * typ3 = 3: imported
   *
   * @param type
   */
  getTotalValidRecords(type: number): DataFeedsObject[] {

    let newList: DataFeedsObject[] = [];

    switch (type) {
      case 1:
        if (!this.matched || !this.validCompanies || this.validCompanies.length <= 0 || this.matched.length <= 0) {
          return;
        }
        this.getValidRecords(this.matched, this.validCompanies, newList);
        break;
      case 2:
        if (!this.unmatched || !this.validCompanies || this.validCompanies.length <= 0 || this.unmatched.length <= 0) {
          return;
        }
        this.getValidRecords(this.unmatched, this.validCompanies, newList);
        break;
      case 3:
        if (!this.imported || !this.validCompanies || this.validCompanies.length <= 0 || this.imported.length <= 0) {
          return;
        }
        this.getValidRecords(this.imported, this.validCompanies, newList);
        break;
      default:
    }

    this.loaderService.hide();
    return newList;
  }

  activeFeedsClick() {
    this.router.navigate(["/data-feeds"]);
  }

  importFileClick() {
    this.router.navigate(["/data-feeds/import-file"]);
  }

  expiredFeedClick(expiredFeed: ExpiredCompany) {
    if (expiredFeed.companyName === "MoneySoft")
      window.open("https://www.moneysoft.com.au/support/");
  }

  btnResolveClick(value: DataFeedsObject) {

    if (value.status === "unmatched") {
      sessionStorage.setItem("isUnmatched", "true");
    }

    if (value.name === "TAL") {
      this.dataFeedsService.setSelectedProvider(value.name);
      this.router.navigate(["/data-feeds/personal-insurance"]);
    }

    if (value.name === "MoneySoft") {
      this.router.navigate(["/data-feeds/client-asset"]);
    }

    if (value.name === "Hub24") {
      this.router.navigate(["/data-feeds/hub24"]);
    }

    if (value.name === "Macquarie") {
      this.router.navigate(["/data-feeds/macquarie"]);
    }

    if (value.name === "Netwealth") {
      this.router.navigate(["/data-feeds/netwealth"]);
    }

    if (value.name === "DesktopBroker") {
      this.router.navigate(["/data-feeds/desktopbroker"]);
    }

    if (value.name === "Class") {
      this.router.navigate(["/data-feeds/class"]);
    }
  }

  getDataFeedName(name: string) {
    if (name === "DesktopBroker") {
      name = "Desktop Broker";
    }
    return name;
  }

  /**
   * PRIVATE SECTION
   *
   */

  private getAllData(): any {
    this.loaderService.show();
    this.dataFeedsService.getThirdPartyOverview().subscribe(response => {
      if (response) {
        this.loaderService.hide();
        this.imported = this.convertDataToDataFeedsObject(response.Imported);
        this.matched = this.convertDataToDataFeedsObject(response.Matched);
        this.unmatched = this.convertDataToDataFeedsObject(response.Unmatched, "unmatched");
      }
    }, error => {
      this.loaderService.hide();
      console.log("error");
      console.log(error);
    });
  }

  private getAllThirdParties(): any {
    this.loaderService.show();
    this.thirdPartyService.getThirdParties().subscribe(response => {

      // get active feeds and valid companies
      this.getValidCompanies(response);

      // get invalid account from third parties
      this.getExpiredAccount(response);

    }, error => {
      this.loaderService.hide();
      console.log(error);
    });
  }

  /**
   * Find companies with connectionStatus = false
   *
   * Call api to get info of the expired account
   * @param thirdParties
   */
  private getExpiredAccount(thirdParties: ThirdPartyInfo[]) {
    let list = thirdParties.filter(company => !company.connectionStatus && company.enabled);
    if (list.length > 0) {
      let observables: Array<Observable<any>> = [];

      list.forEach(c => {
        observables.push(this.thirdPartyService.getThirdParty(c.name));
      });
      if (observables.length > 0) {
        this.iSub = Observable.zip.apply(null, observables).subscribe(res => {
          if (this.iSub) {
            this.iSub.unsubscribe();
          }
          if (res && res.length > 0) {
            res.forEach(expiredComp => {
              let data = expiredComp as ThirdParty<ThirdPartyDataFeedSettings, RESTConnection>;
              this.expiredCompanies.push(new ExpiredCompany(data.connection.username, data.name));
            });
          }
        }, err => {
          console.log(err);
        });
      }
    }
  }

  private convertDataToDataFeedsObject(list: any[], status?: string): DataFeedsObject[] {

    if (!list && list.length <= 0) return;
    let result = [];

    list.forEach(item => {
      if (item.MoneySoft) {
        let temp: DataFeedsObject = new DataFeedsObject();

        temp.name = "MoneySoft";
        temp.value = item.MoneySoft.clientAsset;
        temp.date = item.date;
        temp.status = status;

        result.push(temp);
      }

      if (item.Hub24) {
        let temp: DataFeedsObject = new DataFeedsObject();

        temp.name = "Hub24";
        temp.value = item.Hub24.clientAsset;
        temp.date = item.date;
        temp.status = status;

        result.push(temp);
      }

      if (item.Macquarie) {
        let temp: DataFeedsObject = new DataFeedsObject();

        temp.name = "Macquarie";
        temp.value = item.Macquarie.clientAsset;
        temp.date = item.date;
        temp.status = status;

        result.push(temp);
      }

      if (item.Netwealth) {
        let temp: DataFeedsObject = new DataFeedsObject();

        temp.name = "Netwealth";
        temp.value = item.Netwealth.clientAsset;
        temp.date = item.date;
        temp.status = status;

        result.push(temp);
      }

      if (item.DesktopBroker) {
        let temp: DataFeedsObject = new DataFeedsObject();

        temp.name = "DesktopBroker";
        temp.value = item.DesktopBroker.clientAsset;
        temp.date = item.date;
        temp.status = status;

        result.push(temp);
      }

      if (item.TAL && item.TAL.insurance > 0) {
        let temp: DataFeedsObject = new DataFeedsObject();

        temp.name = "TAL";
        temp.value = item.TAL.insurance;
        temp.date = item.date;
        temp.status = status;

        result.push(temp);
      }

      if (item.Class) {
        let temp: DataFeedsObject = new DataFeedsObject();

        temp.name = "Class";
        temp.value = item.Class.clientAsset + item.Class.client + item.Class.member;
        temp.date = item.date;
        temp.status = status;

        result.push(temp);
      }
    });

    return result;
  }

  // Select a record from the given list then compare it with the active company
  // If matched => add to newList
  private addValidRecordtoNewList(newList: any[], list: any[], company) {
    if (list && list.length > 0) {
      let temp: DataFeedsObject = new DataFeedsObject();
      temp.name = company;
      list.forEach(record => {
        temp.value += record.value;
        temp.date = record.date;
        temp.status = record.status;
      });

      if (temp.value > 0)
        newList.push(temp);
    }
  }

  private getValidRecords(records: DataFeedsObject[], validCompanies: string[], newList: DataFeedsObject[]) {
    if (!records || !validCompanies || records.length < 1 || validCompanies.length < 1) {
      return;
    }

    validCompanies.forEach(company => {
      // find valid company in list of records
      let list = records.filter(item => item.name === company);

      // add valid records new list and add date
      this.addValidRecordtoNewList(newList, list, company);
    });
  }

  /**
   * Find valid companies from a list of all third parties
   *
   * @param thirdParties
   */
  private getValidCompanies(thirdParties: ThirdPartyInfo[]) {
    this.thirdParties = thirdParties.filter(company => company.enabled === true && company.name !== "Investfit");
    if (this.thirdParties && this.thirdParties.length > 0) {
      this.thirdParties.forEach(company => {
        this.validCompanies.push(company.name);
      });
    }
  }
}
