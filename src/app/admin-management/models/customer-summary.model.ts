
import { LicenceInfo } from './licence-info.model';
import { LicencePackage } from './licence-package.model';
import { CompanyMember } from './company-member.model';

export class CustomerSummary {
    id: string;
    name: string;
    logo: string;
    phone: string;
    mobile: string;
    email: string;
    license: LicenceInfo;
    packages: LicencePackage[];
    users: CompanyMember[];
}