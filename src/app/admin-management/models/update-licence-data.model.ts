
import { LicencePackage } from './licence-package.model';

export class UpdateLicenceData {
    id: string;
    name: string;
    packages: LicencePackage[];
}