import { ClientAsset } from './client-asset.model';

export class AssetProjectionDetails {
    totalBalance: number;
    totalContributions: number;
    year: number;
    assets: ClientAsset[];
}