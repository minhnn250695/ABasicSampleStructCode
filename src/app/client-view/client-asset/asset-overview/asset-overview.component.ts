import { Component, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { saveAs as importedSaveAs } from 'file-saver';
import { ISubscription } from 'rxjs/Subscription';
import { FileUtils, RxUtils } from '../../../common/utils';


// component
import { BaseComponentComponent } from '../../../common/components/base-component';

// entity
import { FileFolderEntity } from '../../client-doc-storage/models';
import { Contact, ClientCalculation, TotalClientAssets, ClientAsset, InvestmentStyle, AssetPurpose, } from '../models';

// service
import { ConfigService } from '../../../common/services/config-service';
import { ClientViewService } from '../../client-view.service';
import { ClientAssetService } from '../client-asset.service';
import { CashFlowService } from '../../cash-flow/cash-flow.service';
import { DocStorageService } from '../../client-doc-storage/doc-storage.service';
import { ConfirmationDialogService } from '../../../common/dialog/confirmation-dialog/confirmation-dialog.service';

declare var $: any;

@Component({
    selector: 'fp-asset-overview',
    templateUrl: './asset-overview.component.html',
    styleUrls: ['./asset-overview.component.css'],
})

export class AssetOverViewComponent extends BaseComponentComponent implements OnInit, OnDestroy {

    @ViewChild("chooseFile") chooseFile: any;

    private houseHolds: Contact[] = [];
    private listOwner: any[] = []; // using storage contac after filter to match with current assetList
    private clientCalculation: ClientCalculation = new ClientCalculation();
    private keys: string[] = [];
    private totalClientAssets: TotalClientAssets = new TotalClientAssets();
    private rxUtils: RxUtils = new RxUtils();
    private listAssets: ClientAsset[] = [];
    private assetTitle = { type: 1, title: "Assets", textType: "Asset Type", historyTitle: "Asset history", mobileTitle: "My Assets" };
    private totalAssetData = {
        firstCol: { text: "Total assets", value: 0, icon: "fa-list dark-pink", mobileLabel: "" },
        secondCol: { text: "Total investment", value: 0, icon: "fa-chart-line dark-pink", mobileLabel: "" },
        thirdCol: { text: "Total lifestyle", value: 0, icon: "fa-car dark-pink", mobileLabel: "" }
    };
    private assetDetails: ClientAsset = new ClientAsset();
    private assetTypes: any[] = [];
    private itemTypes: any[] = []; // using storage asset type after filter to match with current assetList
    private contact: Contact = new Contact();
    private dislayedFiles: FileFolderEntity[] = [];
    private isFileLoading: boolean = false;
    private iSubscription: ISubscription;
    private fileSubscription: any;

    // FOR MOBILE
    private screenHeight = window.innerHeight;
    @ViewChild('drawer') drawer;
    private showSideBar: boolean = false;
    private fileUtils: FileUtils = new FileUtils();


    //#region Contructor
    constructor(private router: Router,
        private clientService: ClientViewService,
        private clientAssetService: ClientAssetService,
        private clientViewService: ClientViewService,
        private docStorageService: DocStorageService,
        private confirmationDialogService: ConfirmationDialogService,
        changeDetectorRef: ChangeDetectorRef,
        configService: ConfigService,
    ) {
        super(configService, changeDetectorRef);
    }

    ngOnInit() {
        this.onBaseInit();
        let list: Array<Observable<any>> = [];
        list.push(this.clientAssetService.getAssetTypeList());
        if (this.clientAssetService.houseHolds.length <= 0) {
            list.push(this.clientAssetService.houseHoldEvent);
            list.push(this.clientViewService.clientCalculationEvent);
        }
        if (!this.clientViewService.currentScenario.id)
            list.push(this.clientViewService.getCurrentScenario(localStorage.getItem('houseHoldID')));
        this.clientService.showLoading();
        this.iSubscription = Observable.zip.apply(null, list).subscribe((results: any[]) => {
            if (this.iSubscription) {
                this.iSubscription.unsubscribe();
            }
            this.assetTypes = results && results[0];
            this.houseHolds = this.clientAssetService.houseHolds;
            this.clientCalculation = this.clientAssetService.clientCalculation;
            this.keys = this.houseHolds ? this.houseHolds.filter(item => item.isDisplayedInUi).map(item => item.id) : [];
            this.loadClientAssets(this.keys);
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
    private loadClientAssets(keys: string[]) {
        this.clientAssetService.getClientAssetsFor(this.keys).subscribe(total => {
            this.totalClientAssets = total;
            this.calculateTotalAssets();
        }, err => {
            console.log("Error", err);
        });
    }

    private changeSelectedItemDetails(asset: ClientAsset) {
        this.assetDetails = asset;
        this.dislayedFiles = [];
        if (!asset.name) return; // asset list empty after filter => so default info

        this.loadUserAssetDocuments();
        this.clientService.clientCalculationEvent.subscribe(res => {
            this.clientCalculation = res;
        });

        if (this.isMobile)
            this.openSideBar();
    }


    private calculateTotalAssets() {
        if (!this.totalClientAssets) {
            return;
        }
        this.listAssets = this.totalClientAssets.getAssetList(this.keys);
        // filter list contacts is existing in asset list
        this.filterOwner(this.listAssets, this.houseHolds);
        // filter list asset type is existing in asset list
        this.filterAssetType(this.listAssets, this.assetTypes);

        // set first asset as selected
        this.assetDetails = this.listAssets[0];
        // Load files of the first asset        
        this.loadUserAssetDocuments();
        this.clientService.clientCalculationEvent.subscribe(res => {
            this.clientCalculation = res;
        });

        let totalAsset = this.totalClientAssets.getTotalAssets();
        let totalInvestment = this.totalClientAssets.getTotalInvestment();
        let totalLifeStyle = this.totalClientAssets.getTotalLifeStyle();
        this.totalAssetData = {
            firstCol: { text: "Total assets", value: totalAsset, icon: "fa-list dark-pink", mobileLabel: "Total Assets" },
            secondCol: { text: "Total investment", value: totalInvestment, icon: "fa-chart-line dark-pink", mobileLabel: "Investment" },
            thirdCol: { text: "Total lifestyle", value: totalLifeStyle, icon: "fa-car dark-pink", mobileLabel: "Lifestyle" }
        };
        this.clientService.hideLoading();
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
    private getProfileImgUrl(asset: ClientAsset): string {
        if (!asset || !asset.primaryClientId) return null;
        let id = asset.primaryClientId;
        if (this.houseHolds) {
            let client = this.houseHolds.find(item => item.id === id);
            if (client) {
                return client.profileImageUrl;
            }
        }
        return null;
    }

    private getFullName() {
        if (this.assetDetails && this.assetDetails.primaryClientId) {
            this.contact = this.houseHolds && this.houseHolds.find(item => item.id === this.assetDetails.primaryClientId);
            return this.contact && `${this.contact.firstName || ''} ${this.contact.lastName || ''}` || '';
        } else return null;
    }
    //#endregion handle asset avatar


    //#region handle Files
    private uploadFileClick() {
        this.chooseFile.nativeElement.click();
    }

    private myFolder() {
        return this.assetDetails && `Assets/${this.assetDetails.name}`;
    }

    private loadUserAssetDocuments() {
        if (this.assetDetails) {
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
        this.isFileLoading = true;
        this.clientService.showLoading();
        let houseHoldId = localStorage.getItem('houseHoldID');
        this.docStorageService.uploadFileToFolder(houseHoldId, file, this.myFolder()).subscribe(res => {
            this.clientService.hideLoading();
            this.loadUserAssetDocuments();
        }, err => {
            this.clientService.hideLoading();
        });
    }

    private deleteUserAssetDocuments(file: FileFolderEntity) {
        if (!file) { return; }
        this.isFileLoading = true;
        this.dislayedFiles = []; // set current files empty => refresh
        this.clientService.showLoading();
        let houseHoldId = localStorage.getItem('houseHoldID');
        this.docStorageService.deleteFileAtFolder(houseHoldId, file.name, file.pathFolder).subscribe(res => {
            this.clientService.hideLoading();
            this.loadUserAssetDocuments();
        }, err => {
            this.clientService.hideLoading();
        });
    }

    private downloadFileFromServer(file: FileFolderEntity) {
        if (!file) return;

        this.clientService.showLoading();
        let houseHoldId = localStorage.getItem('houseHoldID');
        this.docStorageService.downloadFile(houseHoldId, file.pathFolder, file.name).subscribe(res => {
            this.clientService.hideLoading();
            importedSaveAs(res.blob(), file.name);
        }, err => {
            this.clientService.hideLoading();
        });
    }
    //#endregion handle file


    //#region Helper
    private getInvestmentStyle() {
        if (this.assetDetails && this.assetDetails.investmentStyle) {
            switch (this.assetDetails.investmentStyle) {
                case InvestmentStyle.Aggressive.toString(): return "Aggressive";
                case InvestmentStyle.Balanced.toString(): return "Balanced";
                case InvestmentStyle.Conservative.toString(): return "Conservative";
                case InvestmentStyle.Custom.toString(): return "Custom";
                case InvestmentStyle.Defensive.toString(): return "Defensive";
                case InvestmentStyle.Growth.toString(): return "Growth";
                default: return 'N/A';
            }
        }
        return 'N/A';
    }

    private isLifeStyle() {
        if (this.assetDetails && this.assetDetails.assetPurpose) {
            return AssetPurpose.Lifestyle.toString() === this.assetDetails.assetPurpose;
        }
        return false;
    }

    private filterOwner(assets: ClientAsset[], contacts: Contact[]) {
        this.listOwner = [];
        if (!assets || !contacts) return;
        assets.forEach(asset => {
            contacts.map(contact => {
                let owner = { id: contact.id, fullName: contact.fullName };
                let index = this.listOwner.findIndex(item => item.id == owner.id);
                // make sure this owner was not filter yet
                if (index == -1 && asset.primaryClientId == contact.id) {
                    this.listOwner.push(owner);
                }
            });
        });
    }

    private filterAssetType(assets: ClientAsset[], assetTypes: any[]) {
        this.itemTypes = [];
        if (!assets || !assetTypes) return;
        assets.forEach(asset => {
            assetTypes.forEach(assetType => {
                let index = this.itemTypes.findIndex(item => item.value == assetType.value);
                if (index == -1 && asset.assetType == assetType.value) {
                    this.itemTypes.push(assetType);
                }
            });
        });
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