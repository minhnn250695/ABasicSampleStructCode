import { CompanyMember, Customer, CustomerSummary, LicencePackageType, UpdatePermissionRequest, UpdateStatusData } from '../models';
export class CustomerSummaryState {
  selectedCustomer: Customer;
  customerSummary: CustomerSummary;
  // company info
  email() {
    return this.customerSummary && this.customerSummary.email || 'N/A';
  }
  mobilePhone() {
    return this.customerSummary && this.customerSummary.mobile || 'N/A';
  }
  businessPhone() {
    return this.customerSummary && this.customerSummary.phone || 'N/A';
  }
  companyLogoUrl() {
    return this.customerSummary && this.customerSummary.logo || '';
  }
  // billing
  monthlyBillingAmount() {
    return this.customerSummary && this.customerSummary.license && this.customerSummary.license.monthlyBillingAmount || 'N/A';
  }
  nextBillDate() {
    return this.customerSummary && this.customerSummary.license && this.customerSummary.license.nextBillingDay || 'N/A';
  }
  // company members
  getCompanyMembers(): CompanyMember[] {
    return this.customerSummary && this.customerSummary.users || [];
  }
  saveCompanyMembers(members: CompanyMember[]) {
    if (!this.customerSummary)
      return;
    this.customerSummary.users = members;
  }
  // licences
  getLicenceInfo() {
    return this.customerSummary && this.customerSummary.license;
  }
  getCrmLicenseSummary() {
    return `${this.getAssignedCrmLicense() || 0} of ${this.getTotalCrmPurchased() || 0}`;
  }
  getPortalLicenseSummary() {
    return `${this.getAssignedPortalLicense() || 0} of ${this.getTotalPortalPurchased() || 0}`;
  }
  // assigned crm
  getAssignedCrmLicense() {
    let companyMembers = this.getCompanyMembers();
    return companyMembers && companyMembers.reduce((total, member) => {
      return total + (member.permissionCRM ? 1 : 0);
    }, 0);
  }
  // assigned portal
  getAssignedPortalLicense() {
    let companyMembers = this.getCompanyMembers();
    return companyMembers && companyMembers.reduce((total, member) => {
      return total + (member.permissionPortal ? 1 : 0);
    }, 0);
  }
  /**
   *
   * @param isAssigned
   * @param member
   */
  updatePermission(request: UpdatePermissionRequest) {
    let companyMembers = this.getCompanyMembers();
    let result = companyMembers && companyMembers.map((item) => {
      if (item.userName === request.username) {
        if (request.type === LicencePackageType.CRM)
          item.permissionCRM = request.enabled;
        else if (request.type === LicencePackageType.PORTAL)
          item.permissionPortal = request.enabled;
      }
      return item;
    });
    this.saveCompanyMembers(result);
  }
  updateStatus(status: UpdateStatusData) {
    if (this.customerSummary && this.customerSummary.license) {
      this.customerSummary.license.status = status.status;
      this.customerSummary.license.description = status.description;
    }
  }
  isMaxCrmLicense() {
    return this.getAssignedCrmLicense() >= this.getTotalCrmPurchased();
  }
  isMaxPortalLicense() {
    return this.getAssignedPortalLicense() >= this.getTotalPortalPurchased();
  }
  getTotalCrmPurchased() {
    let license = this.customerSummary && this.customerSummary.packages &&
      this.customerSummary.packages.find(item => item.type === LicencePackageType.CRM);
    return license && license.purchased || 0;
  }
  getTotalPortalPurchased() {
    let license = this.customerSummary && this.customerSummary.packages &&
      this.customerSummary.packages.find(item => item.type === LicencePackageType.PORTAL);
    return license && license.purchased || 0;
  }
  getTotalBIPurchased() {
    let license = this.customerSummary && this.customerSummary.packages &&
      this.customerSummary.packages.find(item => item.type === LicencePackageType.BI);
    return license && license.purchased || 0;
  }
}
