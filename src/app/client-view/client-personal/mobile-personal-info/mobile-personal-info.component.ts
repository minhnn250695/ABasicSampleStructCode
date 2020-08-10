import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef, ViewChild, SimpleChanges } from '@angular/core';
import { PersonalInfoComponent } from './../personal-info/personal-info.component';

// services
import { ConfigService } from '../../../common/services/config-service';
import { RefreshService } from '../../../common/services/refresh.service';
import { CashFlowService } from '../../cash-flow/cash-flow.service';
import { ClientViewService } from '../../client-view.service';

declare var $: any;
// entity
import { CashFlow, ClientCalculation, Contact, MaritalStatusCode } from '../../models';

@Component({
  selector: 'fp-mobile-personal-info',
  templateUrl: './mobile-personal-info.component.html',
  styleUrls: ['./mobile-personal-info.component.css']
})
export class MobilePersonalInfoComponent extends PersonalInfoComponent implements OnInit, OnDestroy {
  @Input() id: number = 0;
  @Input() client: Contact = new Contact();
  @Input() cashFlow: CashFlow = new CashFlow();
  @Input() houseHold: Contact[] = new Array<Contact>();

  @ViewChild('drawer') drawer;

  // Sidebar
  private selectedSection: string = '';
  private showSideBar: boolean = false;
  private title: string = '';
  private sections: any = {
    personalInformation: { label: "Personal Information", fields: ['Age', 'Birthday', 'MaritalStatus', 'Retirement'] },
    contact: { label: "Contact Information", fields: ['Address', 'Email', 'Phone', 'Mobile'] },
    employment: { label: "Employment Information", fields: ['Employer', 'Role', 'GrossSalary', 'SalaryPackaging', 'GovermentIncome', 'OtherIncome', 'IncomeTax', 'Superannuation'] },
    health: { label: "Health Information", fields: ['Smoke', 'Weight', 'Height', 'BMI'] }
  };
  private displayedFields: any = [];
  private showAddressFields: boolean = false;

  constructor(clientService: ClientViewService,
    cashFlowService: CashFlowService,
    refreshService: RefreshService,
    configService: ConfigService,
    changeDetectorRef: ChangeDetectorRef) {
    super(clientService, cashFlowService, refreshService, configService, changeDetectorRef);
  }

  ngOnInit() {
    super.onBaseInit();
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

  /** ================================================================
 *                      INITAL SETUP
 ===================================================================*/
  private getDisplayedFields() {
    this.displayedFields = [];
    let fields = this.sections[this.selectedSection].fields;
    fields.forEach((field) => {
      this.displayedFields.push(this.getClientDisplayInfo(field));
    });
    if (this.selectedSection === 'contact') {
      let addressFields = this.getClientAddressDetails();
      addressFields.forEach((address, index) => {
        this.displayedFields.splice(index + 1, 0, address);
      })
    }
    else if(this.selectedSection === 'health'){
      this.getBmiDisplayedValue();
    }
  }

  /** ================================================================
 *                      EVENT HANDLER
 ===================================================================*/

  // Check field show in haft row or full row
  private isShowInFullRow(item) {
    if (item.id === 'employment-gross-salary') return false;
    else if (item.id === 'employment-salary-packaging') return false;
    else if (item.id === 'employment-goverment-income') return false;
    else if (item.id === 'employment-other-income') return false;
    else if (item.id === 'employment-income-tax') return false;
    else if (item.id === 'employment-superannuation') return false;
    return true;
  }

  private toggleAddressFields() {
    this.showAddressFields = !this.showAddressFields;
  }

  /** ================================================================
   *                      SIDEBAR HANDLER
   ===================================================================*/

  private onSelectSection(section) {
    this.selectedSection = section;
    this.title = this.sections[this.selectedSection].label;
    this.getDisplayedFields();
    this.drawer.open();
  }

  private openSideBar() {
    this.drawer.open();
    this.showSideBar = true;
    $('body').css('overflow-y', 'hidden');
  }

  private closeSideBar() {
    $('body').css('overflow-y', 'auto');
    this.drawer.close();
    this.showSideBar = false;
    this.showAddressFields = false;
    this.cancelEditClientInfo(this.selectedSection);
  }

}
