import { ClientAsset } from './client-asset.model';
import { AssetPurpose } from './asset-purpose.enum';

import { FinanceUtil } from '../../common/utils';

export class TotalClientAssets {
    private assetMap: Map<string, ClientAsset[]>;
    private financeUtil: FinanceUtil = new FinanceUtil();

    constructor() {
        this.assetMap = new Map<string, ClientAsset[]>();
    }

    getAssetList(wantedKeys?: string[]): ClientAsset[] {
        if (!this.assetMap) return [];
        let keys = wantedKeys || Array.from(this.assetMap.keys());

        if (!keys) { return []; };

        let results: ClientAsset[] = []
        keys.forEach(key => {
            let assets = this.get(key);
            if (assets) {
                results = results.concat(assets);
            }
        })

        return results;
    }

    getAllClientAssets(ids?: string[]): ClientAsset[] {
        if (!this.assetMap) return [];

        let keys: string[] = ids || Array.from(this.assetMap.keys());
        let result: ClientAsset[] = [];

        keys.forEach(key => {
            let debts = this.get(key);
            if (debts) {
                result = result.concat(debts);
            }
        })

        return result;
    }

    /**
     * get total assets
     */
    getTotalAssets(ids?: string[]): number {
        let total = 0;
        this.forEachData(ids, (asset => {
            total = total + (asset.currentBalance || 0);
        }))
        return total;
    }

    getTotalInvestment(ids?: string[]) {
        let total = 0;
        this.forEachData(ids, (asset => {
            total = total + (asset.assetPurpose == AssetPurpose.Investment.toString() ? (asset.currentBalance || 0) : 0);
        }))
        return total;
    }

    getTotalLifeStyle(ids?: string[]) {
        let total = 0;
        this.forEachData(ids, (asset => {
            total = total + (asset.assetPurpose == AssetPurpose.Lifestyle.toString() ? (asset.currentBalance || 0) : 0);
        }))
        return total;
    }

    getNetContributions(ids?: string[]): number {
        let total = 0;
        this.forEachData(ids, (asset => {
            total = total + (asset.annualNetContributions || 0) - (asset.annualWithdrawals || 0)
        }))
        return total;
    }

    getInvestmentContributions(ids?: string[]): number {
        let total = 0;
        this.forEachData(ids, (asset => {
            total = total + (asset.annualNetContributions || 0)
        }))
        return total;
    }


    private forEachData(ids: string[], callback: (cached: ClientAsset) => void) {
        let newIds = ids || Array.from(this.assetMap.keys());
        if (!newIds || newIds && newIds.length == 0) {
            return 0;

        }

        let assets = this.getAllClientAssets(newIds);
        assets.forEach(asset => {
            if (asset) callback(asset);
        });
    }


    getFutureTotalInvestment(numOfYear: number, calculatedKeys?: string[]) {

        let keys = calculatedKeys || Array.from(this.assetMap.keys());
        if (!keys) { return 0; };

        let total = 0;

        keys.forEach(key => {
            let assets = this.get(key);
            let newAssets = assets && assets.filter(item => item.assetPurpose == AssetPurpose.Investment.toString());
            total = total + this.assetFutureValue(assets, numOfYear)
        });

        return total;
    }

    assetFutureValue(assets: ClientAsset[], numOfYear: number) {
        if (!assets || assets && assets.length == 0) {
            return 0;
        }

        let total = 0;
        assets.forEach(item => {
            total = total + this.assetFutureValueFor(item, numOfYear);
        });

        return total;
    }

    assetFutureValueFor(asset: ClientAsset, numOfYear: number): number {
        if (!asset || asset && (asset.assetPurpose == AssetPurpose.Lifestyle.toString())) {
            return 0;
        }

        let currentFv = asset.currentBalance || 0;
        let pmt = (asset.annualNetContributions || 0 - asset.annualIncome || 0) * (-1);

        let value = this.financeUtil.FV(asset.estimatedNetReturns / 100 || 0, 1, pmt, currentFv * -1);
        return value >= 0 ? value : 0;
    }

    /**
     * get total assets
     */
    private getAssetsInternal(asset: ClientAsset[]): number {
        if (!asset) return 0;
        let total = 0;
        asset.forEach((item) => {
            if (item.currentBalance) { total = total + item.currentBalance; }
        });
        return total;
    }

    private getTotalInvestmentInternal(asset: ClientAsset[]) {
        if (!asset) return 0;
        let total = 0;
        asset.filter(x => x.assetPurpose == AssetPurpose.Investment.toString()).forEach((item) => {
            if (item.currentBalance) { total = total + item.currentBalance; }
        });
        return total;
    }

    private getTotalLifeStyleInternal(asset: ClientAsset[]) {
        if (!asset) return 0;
        let total = 0;
        asset.filter(x => x.assetPurpose == AssetPurpose.Lifestyle.toString()).forEach((item) => {
            if (item.currentBalance) { total = total + item.currentBalance; }
        });
        return total;
    }

    private getNetContributionsInternal(asset: ClientAsset[]): number {
        if (!asset) return 0;
        let total = 0;
        asset.forEach((item) => {
            if (item.annualNetContributions) { total = total + item.annualNetContributions; }
        });
        return total;
    }

    /**
     * ==============================================================================================================
     * set assetMap value
     * ==============================================================================================================
     */
    add(id: string, assets: ClientAsset[]) {

        let newAssets = assets;
        if (assets) {
            newAssets = assets.map(item => {
                return item;
            })
        }
        this.assetMap.set(id, newAssets);
    }

    addList(ids: string[], assets: ClientAsset[]) {
        if (!ids || ids && ids.length == 0) {
            return;
        }

        ids.forEach(id => {
            let assetsOfId = assets && assets.filter(item => item.primaryClientId == id)
                .map(item => {
                    return item;
                });
            this.assetMap.set(id, assetsOfId);
        });
    }

    remove(id: string) {
        this.assetMap.delete(id);
    }

    get(id): ClientAsset[] {
        return this.assetMap ? this.assetMap.get(id) : null;
    }

    clear() {
        this.assetMap.clear()
    }
}