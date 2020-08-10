import { Customer, CustomerSummary, LicenceInfo, LicencePackage, LicencePackageType, UpdateStatusData } from '../models';
export class CustomerLicenceState {
  selectedCustomer: Customer;
  customerSummary: CustomerSummary;
  isPackagesUpdated: boolean = false;
  getFullUserName() {
    return this.customerSummary && this.customerSummary.name || 'N/A';
  }
  crmLicenceInfo(): LicencePackage {
    let packages = this.getLicensePackages();
    return packages && packages.find(item => item.type === LicencePackageType.CRM);
  }
  portalLicenceInfo(): LicencePackage {
    let packages = this.getLicensePackages();
    return packages && packages.find(item => item.type === LicencePackageType.PORTAL);
  }
  biLicenceInfo(): LicencePackage {
    let packages = this.getLicensePackages();
    return packages && packages.find(item => item.type === LicencePackageType.BI);
  }
  updatePackage(licence: LicencePackage) {
    if (!licence)
      return;
    let packages = this.getLicensePackages();
    if (!packages) {
      this.updateLicencePackages([licence]);
      return;
    }
    let index = packages && packages.findIndex((item) => item.type === licence.type);
    if (index === -1) {
      packages.push(licence);
      this.updateLicencePackages(packages);
      return;
    }
    let newPackages = packages && packages.map(item => {
      return (item.type === licence.type) ? licence : item;
    });
    this.updateLicencePackages(newPackages);
  }
  updateLicencePackages(licenses: LicencePackage[]) {
    if (this.customerSummary)
      this.customerSummary.packages = licenses;
  }
  updateStatus(status: UpdateStatusData) {
    if (this.customerSummary && this.customerSummary.license) {
      this.customerSummary.license.status = status.status;
      this.customerSummary.license.description = status.description;
    }
  }
  getLicenceInfo(): LicenceInfo {
    return this.customerSummary && this.customerSummary.license;
  }
  /**
   *
   */
  getLicensePackages(): LicencePackage[] {
    return this.customerSummary && this.customerSummary.packages;
  }
}
