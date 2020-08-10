import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DataFeedsStorage } from '../data-feeds-storage.service';
import { DataFeedsService } from '../data-feeds.service';
import { HomeUnmatchedList } from '../models';

//
import { RxUtils } from '../../common/utils';
import { ThirdPartyService } from '../../third-party/third-party.service';
import { DataFeedsBaseComponent } from '../data-feeds-base-components.component';
import { ISubscription } from 'rxjs/Subscription';

declare var $: any;

@Component({
  selector: 'app-home-feeds',
  templateUrl: './data-feed-home.component.html',
  styleUrls: ['./data-feed-home.component.css'],
  providers: [ThirdPartyService]
})
export class DataFeedsHomeComponent extends DataFeedsBaseComponent implements OnInit {

  isEmpty: boolean = false;
  isDelete: boolean = false;
  isSelectAll: boolean = false;
  isMobile: boolean;

  thirdPartiesImg: any[] = [];
  Records: any[] = [];
  unmatched: any[] = [];
  matched: any[] = [];
  private iSubscription: ISubscription;
  private rxUtils: RxUtils = new RxUtils();

  constructor(private dataFeedsService: DataFeedsService,
    private thirdPartyService: ThirdPartyService,
    private router: Router,
    private dataFeedsStorage: DataFeedsStorage) {
    super();
  }

  ngOnInit() {
    this.checkUsingMobile();
    this.getInitData();
  }

  ngOnDestroy() {
    if (this.iSubscription) {
      this.iSubscription.unsubscribe();
    }
    this.rxUtils.clear();
    this.dataFeedsService.hideLoading()
    if (this.dataFeedsStorage.home) {
      this.dataFeedsStorage.home.forEach(record => {
        record.isSelected = false;
      });
    }
  }

  getInitData() {
    this.dataFeedsService.showLoading()
    let observables = [this.thirdPartyService.getThirdParties(), this.dataFeedsService.getThirdPartyOverview()];
    this.iSubscription = Observable.zip.apply(null, observables).subscribe(responses => {
      if (this.iSubscription) {
        this.iSubscription.unsubscribe();
      }
      this.dataFeedsService.hideLoading()

      // get thirdparties logo
      responses[0].forEach(thirdParty => this.getImages(thirdParty));
      // thirdparty overview
      if (responses[1]) {
        responses[1].Unmatched.forEach(data => this.bindData({ ...data }, "unmatched"));
        responses[1].Matched.forEach(data => this.bindData({ ...data }, "matched"));
      }
      this.dataFeedsStorage.home = this.Records;
      this.groupData(this.Records);
    });
  }

  btnResolveClick(value: any) {
    // set a flag to indicate that this data feed must show unmatched tab
    if (value.status === "unmatched") {
      sessionStorage.setItem("isUnmatched", "true");
    }

    if (value.name === "TAL") {
      if (value.type === "insurance") {
        // this.dataFeedsService.setSelectedProvider(value.name, value.date);
        this.dataFeedsService.setSelectedProvider(value.name);
        this.router.navigate(["/data-feeds/personal-insurance"]);
      }
    }

    if (value.name === "MoneySoft") {
      if (value.type === "client asset") {
        this.router.navigate(["/data-feeds/client-asset"]);
      }

      if (value.type === "client") {
        this.router.navigate(["/data-feeds/client"]);
      }
    }

    if (value.name === "Hub24") {
      if (value.type === "client asset") {
        this.router.navigate(["/data-feeds/hub24"]);
      }
    }

    if (value.name === "Macquarie") {
      if (value.type === "client asset") {
        this.router.navigate(["/data-feeds/macquarie"]);
      }
    }

    if (value.name === "Netwealth") {
      if (value.type === "client asset") {
        this.router.navigate(["/data-feeds/netwealth"]);
      }
    }

    if (value.name === "DesktopBroker") {
      if (value.type === "client asset") {
        this.router.navigate(["/data-feeds/desktopbroker"]);
      }
    }

    if (value.name === "Class") {
      if (value.type === "client asset") {
        this.router.navigate(["/data-feeds/class"]);
      }
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

  private groupData(data: any[]) {
    if (data.length > 0) {
      data.forEach(item => {
        if (item.status === "matched")
          this.matched.push(item);
        if (item.status === "unmatched" && item.type !== "client")
          this.unmatched.push(item);
      });
    }
  }

  private getImages(item) {
    if (!item) return;
    // let routerLink = "#/data-feeds/home-feeds";
    // switch (item.name) {
    //   // case "CafeX": routerLink = ""; break;
    //   case "DesktopBroker": routerLink = "#/third-party/rest-api-settings/desktopbroker"; break;
    //   case "Hub24": routerLink = "#/third-party/soap-settings/hub24"; break;
    //   // case "Investfit": routerLink = ""; break;
    //   case "MoneySoft": routerLink = "#/third-party/rest-api-settings/moneysoft"; break;
    //   case "Netwealth": routerLink = "#/third-party/netwealth-settings"; break;
    //   case "TAL": {
    //     // this.dataFeedsService.setSelectedProvider("TAL");
    //     routerLink = "#/third-party/sftp-settings";
    //   }; break;
    //   // case "XPlan": routerLink = ""; break;
    //   // default: routerLink = "#/third-party/landing";

    // }
    if (item.name !== "Investfit" && item.name != "LifeRisk" && item.enabled) {

      let obj = {
        name: item.name,
        linkImage: "../../../assets/img/" + item.name.toLowerCase() + ".png",
        // link: routerLink,
        provider: item
      };

      this.thirdPartiesImg.push(obj);
    }
  }

  private goToPage(provider: any) {
    if (!provider) return;
    sessionStorage.setItem("selectedProvider", JSON.stringify(provider));

    // decide go to where depend on the config type
    switch (provider.name) {
      case "Netwealth":
        this.router.navigate(["third-party/netwealth-settings"]); break;
      case "TAL":
        this.router.navigate(["third-party/sftp-settings"]); break;
      case "MoneySoft":
        this.router.navigate(["third-party/rest-api-settings/moneysoft"]); break;
      // case 'Investfit':
      //   this.router.navigate(["third-party/rest-api-settings/investfit"]); break;
      case 'DesktopBroker':
        this.router.navigate(["third-party/rest-api-settings/desktopbroker"]); break;
      case "Hub24":
        this.router.navigate(["third-party/soap-settings/hub24"]); break;
      case "Macquarie":
        this.router.navigate(["third-party/soap-settings/macquariebank"]); break;
      case "Class":
        this.router.navigate(["third-party/oauth-settings/class"]); break;

      default: this.router.navigate(["third-party/landing"]);


    }
  }

  private bindData(item: HomeUnmatchedList, str: string) {

    // client asset of MoneySoft
    if (item.MoneySoft && item.MoneySoft.clientAsset > 0) {
      let x = {
        date: item.date,
        name: "MoneySoft",
        type: "client asset",
        data: item.MoneySoft.clientAsset,
        status: str,
        isSelected: false,
      };

      this.Records.push(x);
    }

    // client of Moneysoft
    if (item.MoneySoft && item.MoneySoft.client > 0 && str === "unmatched") {
      let x = {
        date: item.date,
        name: "MoneySoft",
        type: "client",
        data: item.MoneySoft.client,
        status: str,
        isSelected: false
      };

      this.Records.push(x);
    }

    // insurance
    if (item.TAL && item.TAL.insurance > 0) {
      let x = {
        date: item.date,
        name: "TAL",
        type: "insurance",
        data: item.TAL.insurance,
        status: str,
        isSelected: false
      };

      this.Records.push(x);
    }

    // client asset of Hub24
    if (item.Hub24 && item.Hub24.clientAsset > 0) {
      let x = {
        date: item.date,
        name: "Hub24",
        type: "client asset",
        data: item.Hub24.clientAsset,
        status: str,
        isSelected: false,
      };

      this.Records.push(x);
    }

    // client asset of Macquarie
    if (item.Macquarie && item.Macquarie.clientAsset > 0) {
      let x = {
        date: item.date,
        name: "Macquarie",
        type: "client asset",
        data: item.Macquarie.clientAsset,
        status: str,
        isSelected: false,
      };

      this.Records.push(x);
    }

    // client asset of Netwealth
    if (item.Netwealth && item.Netwealth.clientAsset > 0) {
      let x = {
        date: item.date,
        name: "Netwealth",
        type: "client asset",
        data: item.Netwealth.clientAsset,
        status: str,
        isSelected: false,
      };

      this.Records.push(x);
    }
    // client asset of DesktopBroker
    if (item.DesktopBroker && item.DesktopBroker.clientAsset > 0) {
      let x = {
        date: item.date,
        name: "DesktopBroker",
        type: "client asset",
        data: item.DesktopBroker.clientAsset,
        status: str,
        isSelected: false,
      };

      this.Records.push(x);
    }

    // client asset of DesktopBroker
    if (item.Class && item.Class.client > 0) {
      let x = {
        date: item.date,
        name: "Class",
        type: "client asset",
        data: item.Class.clientAsset,
        status: str,
        isSelected: false,
      };

      this.Records.push(x);
    }

    // empty list
    if (this.Records.length === 0)
      this.isEmpty = true;
  }
}