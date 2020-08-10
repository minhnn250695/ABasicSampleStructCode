import {
  Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef,
  ViewChild
} from '@angular/core';
import { saveAs as importedSaveAs } from 'file-saver';
// services
import { PersonalProtectionService } from '../personal-protection.service';
import { ClientViewService } from '../../client-view.service';
import { LoaderService } from '../../../common/modules/loader';
import { DocStorageService } from '../../client-doc-storage/doc-storage.service';
// models
import { Contact, InsuranceInfo, InsuranceBenefit, PremiumType, BenefitType } from '../models';
import { FileFolderEntity } from '../../client-doc-storage/models';
// utils
import { RxUtils } from '../../../common/utils';

// components
import { BaseComponentComponent } from '../../../common/components/base-component/base-component.component';
import { ConfigService } from '../../../common/services/config-service';

declare var $: any;

@Component({
  selector: 'app-policy-details-v2',
  templateUrl: './policy-details-v2.component.html',
  styleUrls: ['./policy-details-v2.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PolicyDetailsV2Component extends BaseComponentComponent implements OnInit, OnDestroy {
  private houseHoldMembers: Contact[];
  private houseHoldId: string;
  private selectedMemberId: string;
  private insuranceInfoList: InsuranceInfo[];
  private fullInsurance: InsuranceInfo[];
  private selectedInsurance: InsuranceInfo
  private dislayedFiles: FileFolderEntity[];
  private rxUtils: RxUtils = new RxUtils();
  private deletedFile: FileFolderEntity;
  private selectedContact: Contact;
  private isUserAdmin: boolean;

  isLoading: Boolean = false;
  @ViewChild("chooseFile") chooseFile: any;
  @ViewChild("warningDeletemodal") warningDeletemodal: any;
  @ViewChild('cirleImg') cirleImg: any;

  constructor(private clientViewService: ClientViewService,
    private protectionService: PersonalProtectionService,
    private loaderService: LoaderService,
    private docStorageService: DocStorageService,
    configService: ConfigService,
    changeDetectorRef: ChangeDetectorRef) {
    super(configService, changeDetectorRef)
  }
  ngOnInit() {
    super.onBaseInit();
    this.onBaseInit()
    this.isUserAdmin = JSON.parse(localStorage.getItem("authenticatedUser")).isAdmin;
    this.clientViewService.houseHoldObservable.subscribe(houseHold => {
      this.houseHoldMembers = houseHold && houseHold.members
      this.houseHoldId = houseHold && houseHold.id;
      let keys = this.houseHoldMembers && this.houseHoldMembers.map(item => item.id);
      this.selectedContact = this.houseHoldMembers && this.houseHoldMembers[0]
      this.selectedMemberId = this.selectedContact && this.selectedContact.id;
      // let keys = [];
      // keys.push(this.houseHoldMembers[0].id);
      this.loadData(keys);
    });
    // this.insuranceInfoList[0].
  }

  ngOnDestroy() {
    this.onBaseDestroy()
  }

  private insuranceSelecting(event: any) {
    let index = event && event.target && event.target.value;
    this.selectedInsurance = this.insuranceInfoList && this.insuranceInfoList[index];
    this.loadUserDocs(this.selectedInsurance)
    this.dislayedFiles = []
    this.detectChange()
  }

  private memberSelecting(event: any) {
    let index = event && event.target && event.target.value;
    this.selectedContact = this.houseHoldMembers && this.houseHoldMembers[index];
    this.selectedMemberId = this.selectedContact && this.selectedContact.id;

    // this.cirleImg.change();
    this.filterInsurance(this.selectedMemberId);
  }

  /**
   * VIEW ACTION
   */
  private uploadFileClick() {
    this.chooseFile.nativeElement.click()
  }

  private onFileChanged(event) {
    let fileList: FileList = event.target.files;
    if (fileList.length == 1) {
      let file: File = fileList.item(0);
      this.uploadFileToServer(this.selectedInsurance, file);
    }
  }

  private deleteDoc(file: FileFolderEntity) {
    this.deletedFile = file;
    this.warningDeletemodal.show();
  }

  modalDeleteConfirmed() {
    this.deleteUserDocument(this.selectedInsurance, this.deletedFile)
  }

  private downloadFile(file: FileFolderEntity) {
    this.downloadFileFromServer(file);
  }

  /**
   * DATA
   */
  totalPremium() {
    return (this.selectedInsurance && this.selectedInsurance.annualInsurancePremium || 0) +
      (this.selectedInsurance && this.selectedInsurance.policyFee || 0)
  }

  private loadData(keys: string[]) {
    if (!keys || keys && keys.length == 0) {
      this.clientViewService.hideLoading();
      return;
    }

    this.clientViewService.showLoading();
    let sub = this.protectionService.getInsurancePolicyDetailsFor(keys).subscribe(total => {
      this.fullInsurance = total && total.getInsuranceInfos();
      this.filterInsurance(this.selectedMemberId);
      this.clientViewService.hideLoading();
    }, err => {
      this.clientViewService.hideLoading();
    });

    this.rxUtils.addSubscription(sub);
  }

  private filterInsurance(id) {
    if (!id) return;
    this.insuranceInfoList = this.fullInsurance.filter(x => x.primaryClientId == id && x.policyStatus != 100000002);
    this.insuranceInfoList.forEach(x => {
      x.benefits = x.benefits.filter(y => y.benefitStatus != 100000002)
    });
    this.selectedInsurance = this.insuranceInfoList && this.insuranceInfoList[0];
    this.loadUserDocs(this.selectedInsurance)

    this.cirleImg.change();
    this.detectChange();
  }

  private getTileTitle(insuranceInfo: InsuranceInfo): string {
    return insuranceInfo &&
      `${insuranceInfo.productProviderName} / ${insuranceInfo.number} / ${insuranceInfo.name}` || "";
  }

  private getMemberTitle(member: Contact): string {
    return member.firstName || member.lastName;
  }

  private benefits(): InsuranceBenefit[] {
    return this.selectedInsurance && this.selectedInsurance.benefits || [];
  }

  private getPremiumTypeString(benefit: InsuranceBenefit): string {
    let type = benefit && benefit.premiumType;

    switch (type) {
      case PremiumType.Hybrid: return 'Hybrid';
      case PremiumType.Level65: return 'Level 65';
      case PremiumType.Level70: return 'Level 70';
      case PremiumType.Unitised: return 'Unitised';
      case PremiumType.Stepped:
      default: return 'Stepped';
    }
  }

  private getBenefitTypeString(benefit: InsuranceBenefit): string {
    let type = benefit && benefit.type;
    switch (type) {
      case BenefitType.Life: return "Life insurance";
      case BenefitType.TPD: return "Permanent disability";
      case BenefitType.Trauma: return "Trauma";
      case BenefitType.Income_Protection: return "Income";
      case BenefitType.Child_Trauma: return "Child";
      case BenefitType.Business_Expenses: return "Business";
      case BenefitType.Accidental_Death: return "Accidental Death";
      case BenefitType.Accident_Benefit: return "Accident Benefit";
      case BenefitType.Needlestick_Benefit: return "Needlestick Benefit";
    }
  }

  /**
   * DATA
   */
  private myFolder(insurance: InsuranceInfo) {
    if (!insurance) return;
    // return insurance && `Insurance Policies/${insurance.productProviderName}/${insurance.number}_${insurance.name}`;
    let subFolder = insurance.productProviderName + " - " + insurance.number + " - " + insurance.name;
    return insurance && `Insurance Policies/${subFolder}`;
  }

  private loadUserDocs(insurance: InsuranceInfo, isShow: boolean = true) {
    if (this.myFolder(insurance)) {

      // isShow && this.loaderService.show();
      let sub = this.docStorageService.getClientDocuments(this.houseHoldId, this.myFolder(insurance)).subscribe(res => {
        this.dislayedFiles = res && res.childrenFileFolders;
        // isShow && this.loaderService.hide();
        this.detectChange();
      }, err => {
        // isShow && this.loaderService.hide();
      })
      this.rxUtils.addSubscription(sub);

    }
  }

  private uploadFileToServer(insurance: InsuranceInfo, file: File) {
    // this.loaderService.show();
    $('#upload-file').modal('show');
    this.isLoading = true;
    this.docStorageService.uploadFileToFolder(this.houseHoldId, file, this.myFolder(insurance)).subscribe(res => {
      // this.loaderService.hide();
      $('#upload-file').modal('hide');
      $('#complete-upload-file').modal('show');
      this.isLoading = false;
      this.loadUserDocs(insurance);
    }, err => {
      $('#upload-file').modal('hide');
      $('#complete-upload-file').modal('show');
      this.isLoading = false;
      // this.loaderService.hide();
    });
  }

  private deleteUserDocument(insurance: InsuranceInfo, file: FileFolderEntity) {
    if (!file) { return; }

    this.loaderService.show();
    this.docStorageService.deleteFileAtFolder(this.houseHoldId, file.name, file.pathFolder).subscribe(res => {
      this.loaderService.hide();
      this.loadUserDocs(insurance);
    }, err => {
      this.loaderService.hide();
    });
  }

  private downloadFileFromServer(file: FileFolderEntity) {
    if (!file) return;

    this.loaderService.show();
    this.docStorageService.downloadFile(this.houseHoldId, file.pathFolder, file.name).subscribe(res => {
      this.loaderService.hide();
      importedSaveAs(res.blob(), file.name)
    }, err => {
      this.loaderService.hide();
    });
  }

  private profileUrl(): String {
    return this.selectedContact && this.selectedContact.profileImageUrl || '';
  }

  private getFullName() {
    return this.selectedContact && `${this.selectedContact.firstName || ''} ${this.selectedContact.lastName || ''}` || '';
  }

}
