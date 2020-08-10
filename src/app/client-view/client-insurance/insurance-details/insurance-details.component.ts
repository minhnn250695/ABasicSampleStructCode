import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ElementRef, Input, SimpleChanges
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Location } from '@angular/common';
import { ClientInsuranceService } from '../client-insurance.service';
import { ConfirmationDialogService } from '../../../common/dialog/confirmation-dialog/confirmation-dialog.service';


// Component
import { BaseComponentComponent } from '../../../common/components/base-component/base-component.component';
import { ConfigService } from '../../../common/services/config-service';
import { InsuranceInfo, InsuranceBenefit, BenefitType } from '../models';
import { FileFolderEntity, PremiumType } from '../../client-doc-storage/models';
import { FileUtils, RxUtils } from '../../../common/utils';
import { DocStorageService } from '../../client-doc-storage/doc-storage.service';
import { LoaderService } from '../../../common/modules/loader';
import { saveAs as importedSaveAs } from 'file-saver';

declare var $: any;

@Component({
    selector: 'fp-insurance-details',
    templateUrl: './insurance-details.component.html',
    styleUrls: ['./insurance-details.component.css'],
    // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InsuranceDetailsComponent extends BaseComponentComponent implements OnInit, OnDestroy {

    @Input() listInsurance: InsuranceInfo[] = [];
    @Input() contacts: any[] = [];
    @ViewChild("chooseFile") chooseFile: any;

    private insuranceTitle = { type: 3, title: "Policies", textType: "Policy type", historyTitle: "", mobileTitle: "Insurance Policies" };
    private itemTypes: any[] = []; // using storage insurance type after filter to match with current insuranceList
    rxUtils: RxUtils = new RxUtils();

    private dislayedFiles: FileFolderEntity[] = [];
    private insuranceDetails: InsuranceInfo = new InsuranceInfo();
    private listInsuranceFilter: InsuranceInfo[];
    private selectedContact: any;
    private isFileLoading: boolean = false;
    private isFileDeleting: boolean = false;
    private fileSubscription: any;

    // FOR MOBILE
    @ViewChild('drawer') drawer;

    private fileUtils: FileUtils = new FileUtils();
    private screenHeight = window.innerHeight;
    private showSideBar: boolean = false;
    private showDetailsOfInsurancePolicies = [];

    constructor(
        configService: ConfigService,
        private loaderService: LoaderService,
        private clientInsuranceService: ClientInsuranceService,
        private docStorageService: DocStorageService,
        private location: Location,
        changeDetectorRef: ChangeDetectorRef,
        private confirmationDialogService: ConfirmationDialogService
    ) {
        super(configService, changeDetectorRef);
    }

    ngOnInit() {
        this.onBaseInit();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.listInsurance && changes.listInsurance.currentValue) {
            if (this.listInsurance && this.listInsurance.length > 0) {
                this.insuranceDetails = this.listInsurance[0];
                // filter select contact to show avater
                let tempContact = this.contacts.filter(contact => contact.id == this.insuranceDetails.primaryClientId);
                this.selectedContact = tempContact && tempContact[0];
                this.loadUserDocs(this.insuranceDetails);
            }
        }
    }

    ngOnDestroy() {
        this.onBaseDestroy();
        if (this.fileSubscription)
            this.fileSubscription.unsubscribe();
    }

    private backToPreviousPage() {
        this.location.back();
    }

    private changeSelectedItemDetails(insurance: InsuranceInfo) {
        this.insuranceDetails = insurance;
        this.dislayedFiles = [];
        if (!insurance.name) return; // insurance list empty after filter => so default info
        this.loadUserDocs(this.insuranceDetails);
        let tempContact = this.contacts.filter(contact => contact.id == insurance.primaryClientId);
        this.selectedContact = tempContact && tempContact[0];

        if (this.isMobile)
            this.openSideBar();
    }

    private loadUserDocs(insurance: InsuranceInfo) {
        if (this.myFolder(insurance)) {
            this.isFileLoading = true;
            if (this.fileSubscription) {
                this.fileSubscription.unsubscribe();
            }

            let houseHoldId = localStorage.getItem('houseHoldID');
            this.fileSubscription = this.docStorageService.getClientDocuments(houseHoldId, this.myFolder(insurance)).subscribe(res => {
                this.isFileLoading = false;
                if (this.isFileDeleting) {
                    this.isFileDeleting = false;
                }
                this.dislayedFiles = res && res.childrenFileFolders;
                this.detectChange();
            }, err => {
                this.isFileLoading = false;
            })
            this.rxUtils.addSubscription(this.fileSubscription);
        }
    }

    //#region handle Files
    private downloadFile(file: FileFolderEntity) {
        this.downloadFileFromServer(file);
    }

    private uploadFileClick() {
        this.chooseFile.nativeElement.click();
    }

    private onFileChanged(event) {
        let fileList: FileList = event.target.files;
        if (fileList.length === 1) {
            let file: File = fileList.item(0);
            this.uploadFileToServer(file);
        }
    }

    private deleteDoc(file: FileFolderEntity) {
        this.confirmationDialogService.showModal({
            title: "Delete file",
            message: "Are you sure you want to delete this file?",
            btnOkText: "Delete",
            btnCancelText: "Cancel"
        }).subscribe(response => {
            if (response) {
                this.deleteUserAssetDocuments(file);
            }
        })
    }

    private uploadFileToServer(file: File) {
        this.isFileLoading = true;
        this.loaderService.show();
        let houseHoldId = localStorage.getItem('houseHoldID');
        this.docStorageService.uploadFileToFolder(houseHoldId, file, this.myFolder(this.insuranceDetails)).subscribe(res => {
            this.loaderService.hide();
            this.loadUserDocs(this.insuranceDetails);
        }, err => {
            this.loaderService.hide();
        });
    }

    private deleteUserAssetDocuments(file: FileFolderEntity) {
        if (!file) { return; }
        this.isFileDeleting = true;
        this.isFileLoading = true;
        // set current files empty => refresh
        // this.dislayedFiles = [];
        this.detectChange();

        this.loaderService.show();
        let houseHoldId = localStorage.getItem('houseHoldID');
        this.docStorageService.deleteFileAtFolder(houseHoldId, file.name, file.pathFolder).subscribe(res => {
            this.loaderService.hide();
            this.loadUserDocs(this.insuranceDetails);
        }, err => {
            this.loaderService.hide();
        });
    }

    private downloadFileFromServer(file: FileFolderEntity) {
        if (!file) return;

        this.loaderService.show();
        let houseHoldId = localStorage.getItem('houseHoldID');
        this.docStorageService.downloadFile(houseHoldId, file.pathFolder, file.name).subscribe(res => {
            this.loaderService.hide();
            importedSaveAs(res.blob(), file.name);
        }, err => {
            this.loaderService.hide();
        });
    }

    //#endregion hand file

    //#region Helper

    private getInsuranceName(insuranceDetails) {
        if (!insuranceDetails.productProviderName || !insuranceDetails.number || !insuranceDetails.name)
            return 'N/A';
        let name = `${insuranceDetails.productProviderName} / ${insuranceDetails.number} / ${insuranceDetails.name}`;
        return name;
    }

    private myFolder(insurance: InsuranceInfo) {
        if (!insurance) return;
        let subFolder = insurance.productProviderName + " - " + insurance.number + " - " + insurance.name;
        return insurance && `Insurance Policies/${subFolder}`;
    }

    private benefits(): InsuranceBenefit[] {
        return this.insuranceDetails && this.insuranceDetails.benefits || [];
    }

    private profileUrl(): String {
        return this.selectedContact && this.selectedContact.profileImageUrl || '';
    }

    private getFullName() {
        return this.selectedContact && `${this.selectedContact.firstName || ''} ${this.selectedContact.lastName || ''}` || '';
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
    //#endregion Helper

    /** ===========================================================================
     *                                FOR MOBILE
     ============================================================================== */

    //  SIDEBAR
    private openSideBar() {
        this.showSideBar = true;
        window.scroll(0, 0);
        $('body').css('overflow-y', 'hidden');
        this.drawer.open();
    }

    private closeSideBar() {
        this.showSideBar = false;
        $('body').css('overflow-y', 'auto');
        this.drawer.close();
    }

    // EVENT HANDLER

    private getEntityIcon(entity: FileFolderEntity) {
        if (!entity) {
            return 'fa-file';
        }
        if (entity.isFolder) { return 'fa-folder' }

        let name = entity.name;
        let extension = this.fileUtils.getFileExtension(name);
        if (!extension) {
            return 'fa-file';
        }

        switch (extension.toLowerCase()) {
            case 'pdf': return 'fa-file-pdf red';
            case 'xls':
            case 'xlsx': return 'fa-file-excel dark-green';
            case 'doc':
            case 'docx': return 'fa-file-word x-dark-blue';
            case 'png':
            case 'jpg': return 'fa-file-image';
            case 'zip':
            case 'rar': return 'fa-file-archive';
            default:
                return 'fa-file'
        }
    }

    private toggleInsurancePolicyBenefitDetails(index) {
        let existElement = this.showDetailsOfInsurancePolicies.indexOf(index);
        if (existElement > -1) {
            this.showDetailsOfInsurancePolicies.splice(existElement, 1);
        }
        else
            this.showDetailsOfInsurancePolicies.push(index);
    }
}
