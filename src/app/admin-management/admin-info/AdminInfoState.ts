import { UserAccount } from '../../security/user-account.model';
import { CompanyInfo } from '../models';
export class AdminInfoState {
    user: UserAccount;
    companyInfo: CompanyInfo;
    postcode = "3229";
    getName() {
        return this.companyInfo && this.companyInfo.name || '';
    }
    logoUrl(): string {
        return this.companyInfo && this.companyInfo.companyLogoPath || '';
    }
    phone() {
        return this.companyInfo && this.companyInfo.phone || "N/A";
    }
    phoneAlias() {
        return this.companyInfo && this.companyInfo.phoneAlias || null;
    }
    email() {
        return this.companyInfo && this.companyInfo.email || "N/A";
    }
    fullAddress() {
        let list = [];
        if (this.street()) list.push(this.street());
        if (this.street()) list.push(this.city());
        if (this.stateOrProvince()) list.push(this.stateOrProvince());
        if (this.postalCode()) list.push(this.postalCode());
        return list && list.length > 0 ? list.join(", ") : "N/A";
    }
    street() {
        return this.companyInfo && this.companyInfo.addressLine1;
    }
    city() {
        return this.companyInfo && this.companyInfo.city;
    }
    stateOrProvince() {
        return this.companyInfo && this.companyInfo.stateOrProvince;
    }
    postalCode() {
        return this.companyInfo && this.companyInfo.postalCode;
    }
    isPostalCode(code: string) {
        return this.postalCode() && (this.postalCode() === code);
    }
    updateAddress(address: string, city: string, stateOrProvince: string, postalCode: string) {
        this.companyInfo.addressLine1 = address;
        this.companyInfo.city = city;
        this.companyInfo.stateOrProvince = stateOrProvince;
        this.companyInfo.postalCode = postalCode;
    }
    updateEmail(email: string) {
        if (this.companyInfo) {
            this.companyInfo.email = email;
        }
    }
    updatePhone(alias: string, phone: string) {
        if (this.companyInfo) {
            this.companyInfo.phone = phone;
            this.companyInfo.phoneAlias = alias;
        }
    }
}
