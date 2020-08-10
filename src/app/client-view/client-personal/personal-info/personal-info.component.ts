import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy,
  OnInit, SimpleChanges
} from '@angular/core';
import { BaseComponentComponent } from '../../../common/components/base-component/index';


// services
import { ConfigService } from '../../../common/services/config-service';
import { RefreshService } from '../../../common/services/refresh.service';
import { CashFlowService } from '../../cash-flow/cash-flow.service';
import { ClientViewService } from '../../client-view.service';
import { CashFlow, ClientCalculation, Contact, MaritalStatusCode } from '../../models';


declare var $: any;

@Component({
  selector: 'fp-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PersonalInfoComponent extends BaseComponentComponent implements OnInit, OnDestroy, OnChanges {
  @Input() id: number = 0;
  @Input() client: Contact = new Contact();
  @Input() cashFlow: CashFlow = new CashFlow();
  @Input() houseHold: Contact[] = new Array<Contact>();

  clientOutput: Contact = new Contact();
  imageUrl: string;
  isChangeRequired: boolean;
  bmi: number = 0;

  private houseHoldId = localStorage.getItem('houseHoldID');
  private editPersonalInformation: boolean = false;
  private editContact: boolean = false;
  private editEmployment: boolean = false;
  private editHealth: boolean = false;
  enabledEditFields: any = {
    personalInformation: ['maritalStatus', 'retirementAge'],
    contact: ['streetAddressLine1', 'streetAddressCity', 'streetAddressStateOrProvince', 'streetAddressPostalCode', 'homePhone', 'mobilePhone', 'email'],
    employment: ['employer', 'occupation'],
    health: ['height', 'weight', 'smoker']
  };

  constructor(private clientService: ClientViewService,
    private cashFlowService: CashFlowService,
    private refreshService: RefreshService,
    configService: ConfigService,
    changeDetectorRef: ChangeDetectorRef) {
    super(configService, changeDetectorRef);
  }

  ngOnInit() {
    this.checkUsingMobile();
    this.refreshService.refresh.subscribe(res => {
      if (res) {
        this.isChangeRequired = true;
      }
      if (this.isChangeRequired) {
        this.isChangeRequired = false;
      }
    });
  }

  ngOnDestroy() {
    super.onBaseDestroy();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.client && changes.client.currentValue) {
      this.resetToDefault();
      this.clientOutput = JSON.parse(JSON.stringify(this.client));
    }
    this.detectChange();
  }

  resetToDefault() {
    // reset to view mode
    this.editPersonalInformation = false;
    this.editContact = false;
    this.editEmployment = false;
    this.editHealth = false;
  }



  //#region Get Initial Data
  getClientDisplayInfo(field: any) {
    let displayedDetails: any = { enabledEdit: false, type: "", id: "", icon: "", label: "Unknown", value: 'unknown', displayValue: 'N/A' };
    switch (field) {
      // Personal Information
      case "Age": displayedDetails = { enabledEdit: false, type: "number", fieldId: 'age', id: "personal-info-age", icon: this.clientOutput.gender == 2 ? "female" : "male", label: "Age", value: this.clientOutput.age, displayValue: this.getClientDisplayValue(this.clientOutput.age, 'years') }; break;
      case "Birthday": displayedDetails = { enabledEdit: false, type: "date", fieldId: 'birthday', id: "personal-info-dob", icon: "birthday-cake", label: "Birthday", value: this.clientOutput.birthday, displayValue: this.getClientDisplayValue(this.clientOutput.birthday, '') }; break;
      case "MaritalStatus": displayedDetails = { enabledEdit: true, type: "selectOptions", fieldId: 'maritalStatus', id: "personal-info-marital-status", icon: "heart", label: "Marital Status", value: this.clientOutput.maritalStatus, displayValue: this.getMaritalStatus() }; break;
      case "Retirement": displayedDetails = { enabledEdit: true, type: "number", fieldId: 'retirementAge', id: "personal-info-retirement", icon: "cocktail", label: "Retirement", value: this.clientOutput.retirementAge, displayValue: this.getClientDisplayValue(this.clientOutput.retirementAge, 'years') }; break;
      // Contact
      case "Email": displayedDetails = { enabledEdit: true, type: "", fieldId: "email", id: "contact-email", icon: "", label: "Email", value: this.clientOutput.email, displayValue: this.getClientDisplayValue(this.clientOutput.email, '') }; break;
      case "Address": displayedDetails = { enabledEdit: true, type: "address", fieldId: "", id: "contact-address", icon: "", label: "Address", value: this.getClientAddress(), displayValue: this.getClientAddress() }; break;
      case "Phone": displayedDetails = { enabledEdit: true, type: "", fieldId: "homePhone", id: "contact-phone", icon: "", label: "Phone", value: this.clientOutput.homePhone, displayValue: this.getClientDisplayValue(this.clientOutput.homePhone, '') }; break;
      case "Mobile": displayedDetails = { enabledEdit: true, type: "", fieldId: "mobilePhone", id: "contact-mobile", icon: "", label: "Mobile", value: this.clientOutput.mobilePhone, displayValue: this.getClientDisplayValue(this.clientOutput.mobilePhone, '') }; break;
      // // Employment
      case "Employer": displayedDetails = { enabledEdit: true, type: "", fieldId: "employer", id: "employment-employer", icon: "", label: "Employer", value: this.clientOutput.employer, displayValue: this.getClientDisplayValue(this.clientOutput.employer, '') }; break;
      case "GrossSalary": displayedDetails = { enabledEdit: false, type: "currency", fieldId: "grossSalary", id: "employment-gross-salary", icon: "", label: "Gross Salary", value: this.clientOutput.grossSalary, displayValue: this.clientOutput.grossSalary ? this.clientOutput.grossSalary : 'N/A' }; break;
      case "GovermentIncome": displayedDetails = { enabledEdit: false, type: "currency", fieldId: "", id: "employment-goverment-income", icon: "", label: "Goverment income", mobileLabel: "Gov. income", value: this.getClientCashFlowDisplayValue('governmentBenefits'), displayValue: this.getClientCashFlowDisplayValue('governmentBenefits') }; break;
      case "IncomeTax": displayedDetails = { enabledEdit: false, type: "currency", fieldId: "", id: "employment-income-tax", icon: "", label: "Income tax", value: this.getClientCashFlowDisplayValue('incomeTax'), displayValue: this.getClientCashFlowDisplayValue('incomeTax') }; break;
      case "Role": displayedDetails = { enabledEdit: true, type: "", fieldId: "occupation", id: "employment-role", icon: "", label: "Role", value: this.clientOutput.occupation, displayValue: this.getClientDisplayValue(this.clientOutput.occupation, '') }; break;
      case "SalaryPackaging": displayedDetails = { enabledEdit: false, type: "currency", fieldId: "", id: "employment-salary-packaging", icon: "", label: "Pre-tax spending", value: this.getClientCashFlowDisplayValue('salaryPackaging'), displayValue: this.getClientCashFlowDisplayValue('salaryPackaging') }; break;
      case "OtherIncome": displayedDetails = { enabledEdit: false, type: "currency", fieldId: "", id: "employment-other-income", icon: "", label: "Other income", value: this.getClientCashFlowDisplayValue('otherIncome'), displayValue: this.getClientCashFlowDisplayValue('otherIncome') }; break;
      case "Superannuation": displayedDetails = { enabledEdit: false, type: "", fieldId: "", id: "employment-superannuation", icon: "", label: "Superannuation", value: this.clientOutput.superannuationRate, displayValue: this.getClientDisplayValue(this.clientOutput.superannuationRate, '%') }; break;
      // // Health
      case "Smoke": displayedDetails = { enabledEdit: true, type: "trueFalse", fieldId: "smoker", id: "health-smoke", icon: "smoking", label: "Smoke", value: this.clientOutput.smoker, displayValue: this.clientOutput.smoker == undefined ? 'N/A' : this.clientOutput.smoker ? 'Yes' : 'No' }; break;
      case "Weight": displayedDetails = { enabledEdit: true, type: "number", fieldId: "weight", id: "health-weight", icon: "weight", label: "Weight", mobileLabel: "Weight (kg)", value: this.clientOutput.weight, displayValue: this.getClientDisplayValue(this.clientOutput.weight, 'kg') }; break;
      case "Height": displayedDetails = { enabledEdit: true, type: "number", fieldId: "height", id: "health-height", icon: "ruler", label: "Height", mobileLabel: "Height (cm)", value: this.clientOutput.height, displayValue: this.getClientDisplayValue(this.clientOutput.height, 'cm') }; break;
      case "BMI": displayedDetails = { enabledEdit: false, type: "", fieldId: "bmi", id: "health-bmi", icon: "heartbeat", label: "BMI", value: this.clientOutput.bmi, displayValue: this.getClientDisplayValue(this.clientOutput.bmi, '') }; break;

      default:
        displayedDetails = { enabledEdit: false, type: "", id: "", icon: "", label: "Unknown", value: 'unknown', displayValue: 'N/A' };
    }
    return displayedDetails;
  }

  getClientDisplayValue(value: any, additionalDescription: any) {
    let displayValue: any = 'N/A';
    if (value && (value != null && value != '')) {
      displayValue = value;
      if (additionalDescription && additionalDescription != null && additionalDescription != '')
        displayValue += ' ' + additionalDescription;
    }
    return displayValue;
  }

  getClientCashFlowDisplayValue(field: string) {
    if (this.cashFlow) {
      if (this.cashFlow[field] || this.cashFlow[field] == 0)
        return this.cashFlow[field];
    }
    return 'N/A';
  }

  getBmiDisplayedValue(){
    let bmi = this.getClientDisplayInfo('BMI');
    this.bmi = bmi.displayValue;
  }

  //#endregion

  //#region handle onChange events
  onChangeClientInfo(event: any, info: any) {
    let newValue: any = event.target.value;
    if (newValue != '') {
      if (info.type == 'number')
        newValue = newValue;
      if (info.type == 'selectOptions')
        newValue = parseInt(newValue);
      else if (info.type == 'currency')
        newValue = parseFloat(newValue);
      else if (info.type == 'trueFalse')
        newValue = JSON.parse(newValue);
    }
    else
      newValue = null;
    this.clientOutput[info.fieldId] = newValue;
  }

  detectSaveChanges(section: string) {
    let isChanged: boolean = true;
    if (section == 'personalInformation') {
      if ((this.client.maritalStatus != this.clientOutput.maritalStatus) || (this.client.retirementAge != this.clientOutput.retirementAge))
        isChanged = false;
    }
    else if (section == 'contact') {
      if ((this.client.homePhone != this.clientOutput.homePhone) || (this.client.mobilePhone != this.clientOutput.mobilePhone) || (this.client.email != this.clientOutput.email) ||
        (this.client.streetAddressLine1 != this.clientOutput.streetAddressLine1) || (this.client.streetAddressLine2 != this.clientOutput.streetAddressLine2) || (this.client.streetAddressCity != this.clientOutput.streetAddressCity) ||
        (this.client.streetAddressStateOrProvince != this.clientOutput.streetAddressStateOrProvince) || (this.client.streetAddressPostalCode != this.clientOutput.streetAddressPostalCode))
        isChanged = false;
    }
    else if (section == 'employment') {
      if ((this.client.employer != this.clientOutput.employer) || (this.client.occupation != this.clientOutput.occupation))
        isChanged = false;
    }
    else if (section == 'health') {
      if ((this.client.smoker != this.clientOutput.smoker) || (this.client.height != this.clientOutput.height) || (this.client.weight != this.clientOutput.weight))
        isChanged = false;
    }
    return isChanged;
  }

  //#endregion

  //#region handle button click events
  // Perform Edit button click event
  changeToEditMode(section: string) {
    if (section) {
      if (section == 'personalInformation')
        this.editPersonalInformation = !this.editPersonalInformation;
      else if (section == 'contact')
        this.editContact = !this.editContact;
      else if (section == 'employment')
        this.editEmployment = !this.editEmployment;
      else if (section == 'health')
        this.editHealth = !this.editHealth;
    }
  }
  // Perform Save button click event
  saveChanges(section: string) {
    if (section) {
      if (section == 'personalInformation')
        this.editPersonalInformation = !this.editPersonalInformation;
      else if (section == 'contact')
        this.editContact = !this.editContact;
      else if (section == 'employment')
        this.editEmployment = !this.editEmployment;
      else if (section == 'health')
        this.editHealth = !this.editHealth;
      for (var i = 0; i < this.enabledEditFields[section].length; i++) {
        let _field = this.enabledEditFields[section][i];
        this.client[_field] = this.clientOutput[_field];
      }
      this.updateContactToServer(this.client, section);
    }
  }
  // Perform Cancel save changes button click event
  cancelEditClientInfo(section: string) {
    if (section) {
      if (section == 'personalInformation')
        this.editPersonalInformation = !this.editPersonalInformation;
      else if (section == 'contact')
        this.editContact = !this.editContact;
      else if (section == 'employment')
        this.editEmployment = !this.editEmployment;
      else if (section == 'health')
        this.editHealth = !this.editHealth;
      this.resetClientInfo(section);
    }
  }
  // Reset info to the original data
  resetClientInfo(section: any) {
    let resetFields: any = this.enabledEditFields[section];
    for (var i = 0; i < resetFields.length; i++) {
      let _each = resetFields[i];
      if (this.client[_each])
        this.clientOutput[_each] = this.client[_each];
      else
        this.clientOutput[_each] = '';
    }
  }

  //#region 
  //#region handle displayed data
  getPlaceHolder(value: any) {
    if (value)
      return value;
    return '';
  }

  getClientAddressDetails() {
    let addressDetails: any = [];
    addressDetails.push({ enabledEdit: true, isAddressField: true, type: '', fieldId: "streetAddressLine1", id: "contact-address-street-line-1", label: "Residential Address 1", value: this.clientOutput.streetAddressLine1, displayValue: this.getClientDisplayValue(this.clientOutput.streetAddressLine1, '') });
    addressDetails.push({ enabledEdit: true, isAddressField: true, type: '', fieldId: "streetAddressLine2", id: "contact-address-street-line-2", label: "Residential Address 2", value: this.clientOutput.streetAddressLine2, displayValue: this.getClientDisplayValue(this.clientOutput.streetAddressLine1, '') });
    addressDetails.push({ enabledEdit: true, isAddressField: true, type: '', fieldId: "streetAddressCity", id: "contact-address-city", label: "City", value: this.clientOutput.streetAddressCity, displayValue: this.getClientDisplayValue(this.clientOutput.streetAddressCity, '') });
    addressDetails.push({ enabledEdit: true, isAddressField: true, type: '', fieldId: "streetAddressStateOrProvince", id: "contact-address-state", label: "State", value: this.clientOutput.streetAddressStateOrProvince, displayValue: this.getClientDisplayValue(this.clientOutput.streetAddressStateOrProvince, '') });
    addressDetails.push({ enabledEdit: true, isAddressField: true, type: '', fieldId: "streetAddressPostalCode", id: "contact-address-postal-code", label: "Postal Code", value: this.clientOutput.streetAddressPostalCode, displayValue: this.getClientDisplayValue(this.clientOutput.streetAddressPostalCode, '') });
    return addressDetails;
  }

  getSelectMaritalStatus(item: string) {
    let status = this.getMaritalStatus();
    if (status === item)
      return true;
    return null;
  }

  /**
   *
   * @param newContact the updated contact info
   */
  updateContactToServer(newContact: Contact, section: string) {
    this.clientService.showLoading();
    this.clientService.updateContactInfo(newContact)
      .subscribe(res => {
        // load new cash flow
        this.loadNewCashFlow();
        this.clientService.getClientHouseHolds().subscribe(() => {
          //reload current scenario to get the latest cashflow
          if (section === "personalInformation") {
            this.clientService.reloadCurrentScenario(this.houseHoldId).subscribe(res => {
              this.detectChange();
              this.clientService.hideLoading();
            });
          }
          else if (section === "health") {
            this.loadNewHouseHold();
          }
          else {
            this.detectChange();
            this.clientService.hideLoading();
          }
        });
      }, err => { this.clientService.hideLoading(); });
  }

  loadNewCashFlow() {
    // this.loaderService.show();
    this.clientService.showLoading();
    // get new cash flow from server
    let clientId = this.client && this.client.id;
    this.cashFlowService.clearCachedFor(clientId);
    this.cashFlowService.getCashFlowsFor([clientId]).subscribe(res => {
      this.clientService.hideLoading();
    }, err => {
      this.clientService.hideLoading();
    });
  }

  loadNewHouseHold() {
    let seletedClientId = localStorage.getItem('selected_client_id_in_client_view');
    this.clientService.getClientHouseHolds(seletedClientId, true).subscribe(houseHold => {
      this.getBmiDisplayedValue();
      this.detectChange();
    })
  }

  getClientAddress(): string {
    if (!this.client) { return "N/A"; }

    let address = "";
    let addr = [];

    if (this.client.streetAddressLine1) {
      addr.push(this.client.streetAddressLine1);
    }

    if (this.client.streetAddressCity) {
      addr.push(this.client.streetAddressCity);
    }

    if (this.client.streetAddressStateOrProvince) {
      addr.push(this.client.streetAddressStateOrProvince);
    }

    if (this.client.streetAddressPostalCode) {
      addr.push(this.client.streetAddressPostalCode);
    }

    address = addr.join(", ");

    return address ? address : "N/A";
  }

  memberImgUrl() {
    let imageUrl = this.client && this.client.profileImageUrl;
    if (this.refreshService.profileImgOld.toString().includes(imageUrl)) {
      imageUrl = this.refreshService.profileImg;
    }
    return imageUrl;
  }

  getClientFullName(): string {
    if (this.client.firstName && this.client.lastName)
      return `${this.client.firstName} ${this.client.lastName}`;
    else
      return "N/A";
  }

  getMaritalStatus(): string {
    let marialNum = this.client ? this.client.maritalStatus : null;
    if (!marialNum) {
      return "Unknown";
    }
    switch (marialNum) {
      case MaritalStatusCode.SINGLE: return "Single";
      case MaritalStatusCode.MARRIED: return "Married";
      case MaritalStatusCode.WIDOWED: return "Widowed";
      case MaritalStatusCode.DE_FACTO: return "De facto";
      case MaritalStatusCode.DIVORCED: return "Divorced";
      case MaritalStatusCode.SEPARATED: return "Separated";
      case MaritalStatusCode.UNKNOWN:
      default:
        return "Unknown";
    }
  }

  getMaritalStatusCode(marialStatus: String): number {
    if (!marialStatus) {
      return MaritalStatusCode.UNKNOWN;
    }

    switch (marialStatus) {
      case "Single": return MaritalStatusCode.SINGLE;
      case "Married": return MaritalStatusCode.MARRIED;
      case "Widowed": return MaritalStatusCode.WIDOWED;
      case "De facto": return MaritalStatusCode.DE_FACTO;
      case "Divorced": return MaritalStatusCode.DIVORCED;
      case "Separated": return MaritalStatusCode.SEPARATED;
      case "Unknown": return MaritalStatusCode.UNKNOWN;
      default:
        return MaritalStatusCode.UNKNOWN;
    }

  }

  getMaritalStatusList(): string[] {
    return ["Single", "Married", "Widowed", "De facto", "Divorced", "Separated", "Unknown"];
  }

  //#endregion

  isShowImg() {
    let trimName = this.getClientFullName();
    return (!trimName || trimName.length === 0) || this.isUrlValid();
  }

  isShowAvatar() {
    return !this.isShowImg();
  }

  //#region validation
  isUrlValid() {
    let newUrl = this.imageUrl;
    return newUrl && newUrl.length > 0;
  }

  //#endregion

}