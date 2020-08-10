import { Injectable } from "@angular/core";
import { Pairs } from "../revenue-import/models";
import { DataFeedsService } from "./data-feeds.service";
import { ClientAsset, Entity, Insurance, PersonalDetail } from "./models";


@Injectable()
export class DataFeedsStorage {

    //#region Properties
    assets: Pairs[];
    debts: Pairs[];
    insurances: Pairs[];
    home: any[];
    houseHold: Pairs[];

    // client asset
    clientAssetMatched: Array<Entity<ClientAsset>>;
    clientAssetUnMatched: Array<Entity<ClientAsset>>;
    clientAssetIgnored: Array<Entity<ClientAsset>>;

    // client
    clientMatched: Array<Entity<PersonalDetail>>;
    clientUnMatched: Array<Entity<PersonalDetail>>;

    // insurance
    insuranceMatched: Array<Entity<Insurance>>;
    insuranceUnMatched: Array<Entity<Insurance>>;
    //#endregion

    //#region Constructors
    constructor(private dataFeedsService: DataFeedsService) { };
    //#endregion

    //#region Actions
    checkAllClientAsset(): boolean {
        if (this.clientAssetMatched === undefined || this.clientAssetUnMatched === undefined || this.clientAssetIgnored === undefined)
            return false;
        else
            return true;
    }

    checkAllClient(): boolean {
        if (this.clientMatched === undefined || this.clientUnMatched === undefined)
            return false;
        else
            return true;
    }

    checkAllInsurance(): boolean {
        if (this.insuranceMatched === undefined || this.insuranceUnMatched === undefined)
            return false;
        else
            return true;
    }

    checkAllSources() {
        // get assets
        if (!this.assets || this.assets.length < 1) {
            this.dataFeedsService.getAssets().subscribe((response) => {
                if (response) {
                    this.assets = response;
                }
            });
        }

        // get debts
        if (!this.debts || this.debts.length < 1) {
            this.dataFeedsService.getDebts().subscribe((response) => {
                if (response) {
                    this.debts = response;
                }
            });
        }

        // get insurance
        if (!this.insurances || this.insurances.length < 1) {
            this.dataFeedsService.getInsurance().subscribe((response) => {
                if (response) {
                    this.insurances = response;
                }
            });
        }

        // get house hold
        if (!this.houseHold || this.houseHold.length < 1) {
            this.dataFeedsService.getHouseHold().subscribe((response) => {
                if (response) {
                    this.houseHold = response;
                }
            });
        }
    }

    // STORE DATE
    storeClientAsset(matched?: Array<Entity<ClientAsset>>, unMatched?: Array<Entity<ClientAsset>>, ignored?: Array<Entity<ClientAsset>>) {
        if (matched)
            this.clientAssetMatched = matched;
        if (unMatched)
            this.clientAssetUnMatched = unMatched;
        if (ignored)
            this.clientAssetIgnored = ignored;
    }

    storeClient(matched?: Array<Entity<PersonalDetail>>, unMatched?: Array<Entity<PersonalDetail>>) {
        if (matched)
            this.clientMatched = matched;
        if (unMatched)
            this.clientUnMatched = unMatched;
    }

    storeInsurance(matched?: Array<Entity<Insurance>>, unMatched?: Array<Entity<Insurance>>) {
        if (matched)
            this.insuranceMatched = matched;
        if (unMatched)
            this.insuranceUnMatched = unMatched;
    }
    //#endregion

}