import { Component, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from "@angular/core"
import { Router } from '@angular/router';
import { LoaderService } from '../../../common/modules/loader';
import { FileUtils, RxUtils } from '../../../common/utils';
import { Observable } from 'rxjs';
import { saveAs as importedSaveAs } from 'file-saver';
import { ISubscription } from 'rxjs/Subscription';

// service
import { ClientViewService } from '../../client-view.service';
import { ClientDebtService } from '.././client-debt.service'
import { ConfirmationDialogService } from '../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { DocStorageService } from '../../client-doc-storage/doc-storage.service';
import { HandleErrorMessageService } from '../../../common/services/handle-error.service';
import { ConfigService } from '../../../common/services/config-service';


// Entity
import { Contact, ClientCalculation, TotalClientDebts, ClientDebt, DebtTypeAction, InterestRateType } from '../models';
import { FileFolderEntity } from '../../client-doc-storage/models';


// Component
import { BaseComponentComponent } from '../../../common/components/base-component';

declare var $: any;
@Component({
    selector: 'app-debts-overview',
    templateUrl: './debts-overview.component.html',
    styleUrls: ['./debts-overview.component.css']
})

export class DebtsOverviewComponent extends BaseComponentComponent implements OnInit, OnDestroy {

    @ViewChild("chooseFile") chooseFile: any;

    private houseHolds: Contact[] = [];
    private listOwner: any[] = [];
    private clientCalculation: ClientCalculation = new ClientCalculation();
    private keys: string[] = [];
    private totalClientDebts: TotalClientDebts = new TotalClientDebts();
    private rxUtils: RxUtils = new RxUtils();
    private listDebts: ClientDebt[] = [];
    private debtTitle = { type: 2, title: "Debt", textType: "Debt Type", historyTitle: "Debt history", mobileTitle: "My Debts" };
    private totalDebtData = {
        firstCol: { id: "total-net-debt", text: "Total net debt", value: 0, icon: "fa-list light-orange", debtProjection: {}, mobileLabel: 'Total Net Debt', mobileIcon: "fa-list light-orange" },
        secondCol: { id: "deductible-debt", text: "Deductible debt", value: 0, icon: "fa-check light-orange", mobileLabel: 'Deductible', mobileIcon: "fa-check dark-green" },
        thirdCol: { id: "non-deductible-debt", text: "Non-deductible debt", value: 0, icon: "fa-times light-orange", mobileLabel: 'Non-deductible', mobileIcon: "fa-times red" }
    };
    private debtDetails: ClientDebt = new ClientDebt();
    private debtTypes: any[] = [];
    private itemTypes: any[] = [];// using storage asset type after filter to match with current assetList
    private contact: Contact = new Contact();
    private dislayedFiles: FileFolderEntity[] = [];
    private isFileLoading: boolean = false;
    private iSubscription: ISubscription;
    private fileSubscription: any;
    private debtProjections: any = {};

    // FOR MOBILE
    private screenHeight = window.innerHeight;
    @ViewChild('drawer') drawer;
    private showSideBar: boolean = false;
    private fileUtils: FileUtils = new FileUtils();

    //#region Contructor
    constructor(private router: Router,
        private clientDebtService: ClientDebtService,
        private clientViewService: ClientViewService,
        private handleErrorMessageService: HandleErrorMessageService,
        private loaderService: LoaderService,
        private docStorageService: DocStorageService,
        private confirmationDialogService: ConfirmationDialogService,
        changeDetectorRef: ChangeDetectorRef,
        configService: ConfigService) {
        super(configService, changeDetectorRef);
    }

    ngOnInit() {
        this.onBaseInit();
        this.debtTypes = this.debtTypeList();

        let list: Array<Observable<any>> = [];
        list.push(this.clientDebtService.houseHoldsEvent);
        list.push(this.clientViewService.clientCalculationEvent);
        this.clientViewService.showLoading();
        this.iSubscription = Observable.zip.apply(null, list).subscribe((results: any[]) => {
            if (this.iSubscription) {
                this.iSubscription.unsubscribe();
            }
            this.clientCalculation = results && results[1];
            this.houseHolds = results && results[0];
            this.keys = this.houseHolds ? this.houseHolds.filter(item => item.isDisplayedInUi).map(item => item.id) : [];
            let houseHoldId = localStorage.getItem('houseHoldID');
            this.clientViewService.getCurrentScenario(houseHoldId).subscribe(res => {
                if (res) {
                    let totalDebt = JSON.parse(JSON.stringify(this.totalDebtData));
                    totalDebt.firstCol.debtProjection = this.debtProjections = res && res.data && res.data.debtProjections;
                    // refresh totalDebtData variable to make sure it Pass value through @Input method
                    this.totalDebtData = undefined;
                    this.totalDebtData = JSON.parse(JSON.stringify(totalDebt));
                    this.loadClientDebts(this.keys);
                } else {
                    this.clientViewService.hideLoading();
                    this.handleErrorMessageService.handleErrorResponse(res);
                }
            });
        });
    }

    ngOnDestroy() {
        // make sure this subscription (Observable) only call api one time
        this.iSubscription.unsubscribe();
        if (this.fileSubscription)
            this.fileSubscription.unsubscribe();
    }
    //#endregion Contrutor


    //#region Action

    private loadClientDebts(keys: string[]) {
        this.clientDebtService.getClientDebtsFor(keys).subscribe(res => {
            this.totalClientDebts = res;
            this.calculateTotalDebts();
            this.clientViewService.hideLoading();
        }, err => {
            // this.clientViewService.hideLoading();
        });
    }

    private changeSelectedItemDetails(debt: ClientDebt) {
        this.debtDetails = debt;
        this.dislayedFiles = [];
        if (!debt.name) return; // asset list empty after filter => so default info

        this.loadUserDebtDocs();
        this.clientViewService.clientCalculationEvent.subscribe(res => {
            this.clientCalculation = res;
        });

        if (this.isMobile)
            this.openSideBar();
    }

    private calculateTotalDebts() {
        if (!this.totalClientDebts) {
            return;
        }
        this.listDebts = this.totalClientDebts.getDebtList(this.keys);
        // filter list contacts is existing in debt list
        this.filterOwner(this.listDebts, this.houseHolds);
        // filter debt type list is existing in debt list
        this.filterDebtType(this.listDebts, this.debtTypes);

        // set first asset as selected
        this.debtDetails = this.listDebts[0];
        // Load files of the first asset        
        this.loadUserDebtDocs();
        this.clientViewService.clientCalculationEvent.subscribe(res => {
            this.clientCalculation = res;
        });

        let totalNetDebt = this.totalClientDebts.getTotalDebts();
        let totalDeductible = this.totalClientDebts.getTotalDeductiveDebts();
        let totalNonDeductible = this.totalClientDebts.getTotalNonDeductiveDebts();
        this.totalDebtData = {
            firstCol: { id: "total-net-debt", text: "Total net debt", value: totalNetDebt, icon: "fa-list light-orange", debtProjection: {}, mobileLabel: 'Total Net Debt', mobileIcon: "fa-list light-orange" },
            secondCol: { id: "deductible-debt", text: "Deductible debt", value: totalDeductible, icon: "fa-check light-orange", mobileLabel: 'Deductible', mobileIcon: "fa-check dark-green" },
            thirdCol: { id: "non-deductible-debt", text: "Non-deductible debt", value: totalNonDeductible, icon: "fa-times light-orange", mobileLabel: "Non-deductible", mobileIcon: "fa-times red" }
        };
        let totalDebt = JSON.parse(JSON.stringify(this.totalDebtData));
        totalDebt.firstCol.debtProjection = this.debtProjections;
        // refresh totalDebtData variable to make sure it Pass value through @Input method
        this.totalDebtData = undefined;
        this.totalDebtData = JSON.parse(JSON.stringify(totalDebt));
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

    private downloadFile(file: FileFolderEntity) {
        this.downloadFileFromServer(file);
    }
    //#endregion Action

    //#region handle asset avatar
    private getProfileImgUrl(debt: ClientDebt): string {
        if (!debt || !debt.primaryClientId) return null;
        let id = debt.primaryClientId;
        if (this.houseHolds) {
            let client = this.houseHolds.find(item => item.id === id);
            if (client) {
                return client.profileImageUrl;
            }
        }
        return null;
    }

    private getFullName() {
        if (this.debtDetails && this.debtDetails.primaryClientId) {
            this.contact = this.houseHolds && this.houseHolds.find(item => item.id === this.debtDetails.primaryClientId);
            return this.contact && `${this.contact.firstName || ''} ${this.contact.lastName || ''}` || '';
        } else return null;
    }
    //#endregion handle asset avatar


    //#region handle Files
    private uploadFileClick() {
        this.chooseFile.nativeElement.click();
    }

    private myFolder() {
        return this.debtDetails && `Debts/${this.debtDetails.name}`;
    }

    private loadUserDebtDocs() {
        if (this.debtDetails) {
            this.isFileLoading = true;
            if (this.fileSubscription)
                this.fileSubscription.unsubscribe();
            let houseHoldId = localStorage.getItem('houseHoldID');
            this.fileSubscription = this.docStorageService.getClientDocuments(houseHoldId, this.myFolder()).subscribe(res => {
                this.isFileLoading = false;
                this.dislayedFiles = res && res.childrenFileFolders;
            }, err => {
                this.isFileLoading = false;
            });
            this.rxUtils.addSubscription(this.fileSubscription);
        }
    }

    private uploadFileToServer(file: File) {
        this.loaderService.show();
        let houseHoldId = localStorage.getItem('houseHoldID');
        this.docStorageService.uploadFileToFolder(houseHoldId, file, this.myFolder()).subscribe(res => {
            this.loaderService.hide();
            this.loadUserDebtDocs();
        }, err => {
            this.loaderService.hide();
        });
    }

    private deleteUserAssetDocuments(file: FileFolderEntity) {
        if (!file) { return; }
        this.isFileLoading = true;
        this.dislayedFiles = []; // set current files empty => refresh
        this.loaderService.show();
        let houseHoldId = localStorage.getItem('houseHoldID');
        this.docStorageService.deleteFileAtFolder(houseHoldId, file.name, file.pathFolder).subscribe(res => {
            this.loaderService.hide();
            this.loadUserDebtDocs();
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
    //#endregion handle file

    //#region Helper
    private filterOwner(debts: ClientDebt[], contacts: Contact[]) {
        this.listOwner = [];
        debts.forEach(debt => {
            contacts.forEach(contact => {
                let owner = { id: contact.id, fullName: contact.fullName };
                let index = this.listOwner.findIndex(item => item.id == owner.id);
                // make sure this owner was not filter yet
                if (index == -1 && debt.primaryClientId == contact.id) {
                    this.listOwner.push(owner);
                }
            });
        });
    }

    private filterDebtType(debts: ClientDebt[], debtTypes: any[]) {
        this.itemTypes = [];
        debts.forEach(debt => {
            debtTypes.forEach(debtType => {
                let type = { value: debtType.value, label: debtType.label };
                let index = this.itemTypes.findIndex(item => item.value == type.value);
                // make sure this owner was not filter yet
                if (index == -1 && debt.debtType == debtType.value) {
                    this.itemTypes.push(type);
                }
            });
        });
    }

    private debtTypeList() {
        let debtTypes = [
            { label: "Deductible", value: Type.Deductible },
            { label: "NonDeductible", value: Type.NonDeductible },
        ];
        return debtTypes;
    }

    private isDeductible() {
        if (this.debtDetails && this.debtDetails.debtType) {
            return Type.Deductible === this.debtDetails.debtType;
        }
        return false;
    }

    private getDebtType(): string {
        if (!this.debtDetails) {
            return 'N/A';
        }
        let type = this.debtDetails.debtType;
        switch (type) {
            case Type.Deductible: return 'Deductible';
            case Type.NonDeductible: return 'Non Deductible';

            default: return 'N/A';
        }
    }

    private getInterestType(): string {
        if (!this.debtDetails) {
            return 'N/A';

        }

        let type = this.debtDetails.interestRateType;
        switch (type) {
            case InterestRateType.Fixed: return 'Fixed';
            case InterestRateType.Variable: return 'Variable';
            default: return 'N/A';
        }
    }

    private getFrequency() {
        let frequency: string;
        switch (this.debtDetails.repaymentFrequency) {
            case Frequency.Weekly:
                frequency = "weekly";
                break;
            case Frequency.Yearly:
                frequency = "yearly";
                break;
            case Frequency.Fortnightly:
                frequency = "fortnigthly";
                break;
            case Frequency.HalfYearly:
                frequency = "half yearly";
                break;
            case Frequency.Monthly:
                frequency = "monthly";
                break;
            case Frequency.Quarterly:
                frequency = "quarterly";
                break;
            default:
                break;
        }
        return ` ${frequency}`;
    }

    //#endregion Helper

    /** ===========================================================================
    *                                FOR MOBILE
    ============================================================================== */

    private openSideBar() {
        this.showSideBar = true;
        window.scroll(0, 0);
        $('body').css('overflow-y', 'hidden');
        this.drawer.open();
    }

    private closeSideBar() {
        this.showSideBar = false;
        window.scroll(0, 0);
        $('body').css('overflow-y', 'auto');
        this.drawer.close();
    }

    
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
}

const Frequency = {
    Weekly: 100000004,
    Fortnightly: 100000005,
    Monthly: 100000000,
    Quarterly: 100000001,
    HalfYearly: 100000002,
    Yearly: 100000003,
};

const Type = {
    Deductible: 100000000,
    NonDeductible: 100000001
}