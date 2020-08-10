import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { ISubscription } from 'rxjs/Subscription';
import { ConfirmationDialogService } from '../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
// import { LoadingDialog } from '../../../../common/dialog/loading-dialog/loading-dialog.component';
import { ErrorCode } from '../../../../common/models/error-code.enum';
import { Pairs } from '../../../../revenue-import/models';
import { DataFeedsBaseComponent } from '../../../data-feeds-base-components.component';
import { DataFeedsStorage } from '../../../data-feeds-storage.service';
import { DataFeedsService } from '../../../data-feeds.service';
import { Entity, Insurance, InsuranceBenefits } from '../../../models';

declare var $: any;

@Component({
    selector: 'app-personal-unmatch',
    templateUrl: './unmatch-records.component.html',
    styleUrls: ['./unmatch-records.component.css']
})
export class PersonalUnMatchComponent extends DataFeedsBaseComponent implements OnInit, OnDestroy {

    //#region Properties
    @Input("unMatchList") unMatchsInput: Array<Entity<Insurance>> = [];

    selectedEntity: Entity<Insurance> = new Entity<Insurance>();
    informationOfSelectedEntity: Insurance = new Insurance();
    selectedManualMatchRecord: InsuranceBenefits = new InsuranceBenefits();
    compareInsuranceFromCRM: Insurance = new Insurance();
    selectedCRMUnlink: InsuranceBenefits = new InsuranceBenefits();

    unMatchRecords: Array<Entity<Insurance>> = [];
    benefitsOfSelectedEntity: InsuranceBenefits[] = [];
    benefitsOfCompareInsurance: InsuranceBenefits[] = [];

    isSelectAll: boolean = false;
    isSearching: boolean = false;
    isManualMatch: boolean = false;
    isValidtoSave: boolean = false;
    isUnlink: boolean = false;
    isLoading: boolean = false;

    private searchId: string;
    //#endregion

    //#region Constructors
    constructor(private dataFeedsService: DataFeedsService,
        private dataFeedsStorage: DataFeedsStorage,
        private confirmDialogService: ConfirmationDialogService) {
        super();
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
        $('body').removeAttr("style");
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.unMatchsInput && changes.unMatchsInput.currentValue) {
            this.unMatchRecords = JSON.parse(JSON.stringify(this.unMatchsInput));
        }
    }
    //#endregion

    //#region Actions

    //#region Data Table
    onRecordSelectAll(isCheckedAll: boolean) {
        // flag
        this.isSelectAll = !this.isSelectAll;

        this.unMatchRecords = this.unMatchRecords.map(item => {
            item.isSelected = isCheckedAll;
            return item;
        });
    }

    onRecordSelect(unMatchRecord: Entity<Insurance>) {

        if (unMatchRecord.isSelected)
            unMatchRecord.isSelected = false;
        else
            unMatchRecord.isSelected = true;

        let selectedRecords = this.unMatchRecords.filter(record => record.isSelected === true);

        if (selectedRecords.length > 0)
            this.isSelectAll = true;
        else {
            this.isSelectAll = false;
        }
    }

    btnDeleteClick() {
        let list = this.unMatchRecords.filter(record => record.isSelected === true);

        if (list.length > 0) {
            $("#deleteUnMatch").modal('show');
        }
    }

    btnMatchingClick(record: Entity<Insurance>) {
        this.resetModal();

        if (!record || !record.information) { return; }

        this.searchId = record.information.crmId;

        if (this.dataFeedsStorage.insurances)
            this.initAutoComplete(this.dataFeedsStorage.insurances);

        this.bindPopUpProviderInfo(record);
        this.bindPopUpCRMInfo(this.searchId);
    }
    //#endregion

    //#region Modals

    //#region Other modal
    /**
     * Handle `confirm duplicate` records
     * @param value 1 - Overwrite / 2 - Cancel
     */
    btnYesClick(value: number) {
        if (value) {
            this.runLoading.emit(true);
            let form = this.createMatchedForm(this.selectedEntity, value);
            this.dataFeedsService.updateUnMatchedInsurance(form).subscribe(response => {
                if (response.success) {
                    this.isSelectAll = false;
                    this.reloadData(true);
                }
                else {
                    this.reloadData(false);
                    let iSub: ISubscription = this.confirmDialogService.showModal({
                        title: "Error #" + response.error.errorCode,
                        message: response.error.errorMessage,
                        btnOkText: "Ok"
                    }).subscribe(() => {
                        iSub.unsubscribe();
                    });
                }
            });
        }
    }

    /**
     * Handle `confirm delete` record
     */
    btnOKClick() {
        this.deleteRecords();
    }

    //#endregion

    //#region Manual match modal
    btnSaveClick() {
        // let update = this.updateProvider();
        let update = this.updateInsuranceProvider(this.selectedEntity, this.informationOfSelectedEntity, this.compareInsuranceFromCRM, this.benefitsOfSelectedEntity);

        if (this.isValidtoSave) {
            $('#match-modal').modal('hide');
            this.runLoading.emit(true);
            this.dataFeedsService.updateUnMatchedInsurance(this.selectedEntity).subscribe(response => {
                if (response.success) {
                    this.isSelectAll = false;
                    this.reloadData(true);
                    if (response.data && response.data.code === ErrorCode.MANUAL_MATCH_CONFIRM_OVERWRITE) {
                        $('#tal-unmatch-warning').modal({
                            backdrop: 'static',
                        });
                        $('#tal-unmatch-warning').modal("show");
                        this.reloadData(false);
                    }
                } else {
                    this.runLoading.emit(false);
                    this.reloadData(false);
                    let iSub: ISubscription = this.confirmDialogService.showModal({
                        title: "Error #" + response.error.errorCode,
                        message: response.error.errorMessage,
                        btnOkText: "Ok"
                    }).subscribe(() => {
                        iSub.unsubscribe();
                    });

                }
            });
        }

    }

    btnRefreshClick() {
        if (this.searchId) {
            this.bindPopUpCRMInfo(this.searchId);
        }
    }

    // Modal - Provider
    btnIClick(record: InsuranceBenefits) {
        this.isManualMatch = !this.isManualMatch;
        if (record && this.benefitsOfCompareInsurance.length > 0) {
            if (this.isManualMatch === true) {
                this.selectedManualMatchRecord = record;
            }
            else
                this.selectedManualMatchRecord = new InsuranceBenefits();

        }
    }

    btnCheckClick(record: InsuranceBenefits) {
        this.isUnlink = !this.isUnlink;
        if (this.isUnlink === true) {
            this.selectedCRMUnlink = record;
        }
        else {
            this.selectedCRMUnlink = new InsuranceBenefits();
        }
    }

    // Modal - CRM
    btnUnlinkClick(record: InsuranceBenefits) {

        let connectedProvider = this.benefitsOfSelectedEntity.find(providerBenefit => providerBenefit.crmId === record.id);
        connectedProvider.crmId = null;
        connectedProvider.matches = false;
        record.matches = false;
        this.isUnlink = false;
        this.validateInsuranceBenefits();
    }

    btnMapClick(record: InsuranceBenefits) {
        if (record && this.selectedManualMatchRecord) {
            let mapBenefit = this.benefitsOfSelectedEntity.find(item => item.externalId === this.selectedManualMatchRecord.externalId);
            if (mapBenefit) {
                mapBenefit.crmId = record.id;
                mapBenefit.matches = true;

                this.resetDataAfterManualMatch();
            }
        }
    }
    //#endregion

    closeModel() {
        this.unMatchRecords = JSON.parse(JSON.stringify(this.unMatchsInput));
    }
    //#endregion

    txtSearchChanged() {
        let text = $('#tags').val().trim();
        if (text === "") {
            this.resetModal();
            this.validateInsuranceBenefits();
        }
    }

    checkDisable(record: any) {
        if (this.benefitsOfCompareInsurance.length === 0 || !this.searchId) {
            return "disabled";
        }
        else if (this.isManualMatch) {
            if (!record.matches && record.externalId === this.selectedManualMatchRecord.externalId) {
                return null;
            }
            else {
                return "disabled";
            }
        }
        else if (this.isUnlink) {
            if (record.matches && record.crmId === this.selectedCRMUnlink.crmId) {
                return null;
            }
            else {
                return "disabled";
            }
        }
        else return null;
    }

    getToolTipLabel(record) {
        if (record.matches) {
            if (this.isUnlink && record.crmId === this.selectedCRMUnlink.crmId) {
                return "Hide match";
            }
            return "Show match";
        }
        else {
            if (this.isManualMatch && record.externalId === this.selectedManualMatchRecord.externalId) {
                return "Cancel match";
            }
            return "Match";
        }
    }
    //#endregion

    //#region Private
    private getPremiumType(type) {
        if (!type) return "";
        else {
            if (type === "Level65" || type === "Level70")
                return "Level";
            else
                return type;
        }
    }

    private resetDataAfterManualMatch() {
        this.isManualMatch = false;
        this.isUnlink = false;

        // re-check matched CRM records & check is ready to save
        this.checkMatchedCRMRecords(this.benefitsOfCompareInsurance);
        this.validateInsuranceBenefits();
    }

    private createMatchedForm(data: Entity<Insurance>, option?: number) {
        let form = {
            ProviderName: data.providerName,
            EntityName: data.entityName,
            ExternalId: data.externalId,
            CrmId: data.crmId,
            Information: data.information,
            OverwriteOption: option ? option : 0
        };
        return form;
    }

    private deleteRecords() {
        let deleteList = this.unMatchRecords.filter(record => record.isSelected === true);

        if (deleteList.length > 0) {
            this.runLoading.emit(true);

            this.dataFeedsService.deleteInsuranceRecords("DeleteUnmatched", deleteList, error => {
                if (error) {
                    console.log(error);
                    this.reloadData(false);
                }
                else {
                    this.isSelectAll = false;
                    this.reloadData(true);
                }
            });
        }
    }

    private validateInsuranceBenefits() {
        let temp = [];

        this.benefitsOfSelectedEntity.forEach(x => {
            if (!x.crmId || x.crmId === "")
                temp.push(x);
        });

        if (temp.length > 0)
            this.isValidtoSave = false;
        else
            this.isValidtoSave = true;
    }

    private resetModal() {
        $("#Policy").addClass("active");
        $("#policy").addClass("in active");
        $("#Benefits").removeClass("active");
        $("#benefits").removeClass("in active");
        $('#tags').val('');

        // this.isSelectBenefit = false;
        this.isSelectAll = false;
        this.isSearching = false;
        this.isManualMatch = false;
        this.isValidtoSave = false;
        this.isUnlink = false;
        this.searchId = undefined;
        this.selectedCRMUnlink = new InsuranceBenefits();
        this.selectedManualMatchRecord = new InsuranceBenefits();

        this.compareInsuranceFromCRM = new Insurance();
        this.benefitsOfCompareInsurance = [];
    }

    private bindPopUpProviderInfo(record: Entity<Insurance>) {
        this.selectedEntity = record;
        this.informationOfSelectedEntity = record.information;
        this.benefitsOfSelectedEntity = record.information.insuranceBenefits.map(x => {
            if (x.crmId !== undefined && x.crmId !== "")
                x.matches = true;
            else
                x.matches = false;
            return x;
        });
        this.validateInsuranceBenefits();
    }

    private bindPopUpCRMInfo(value: any) {
        if (value) {
            this.isSearching = true;

            this.dataFeedsService.getInSuranceProviderbyCrmId(value).debounceTime(500)
                .subscribe(response => {
                    this.isSearching = false;
                    if (response && response.success && response.data.code === 200) {
                        let val = response.data.data;
                        this.compareInsuranceFromCRM = val;
                        this.benefitsOfCompareInsurance = val.benefits.filter(benefit => benefit.id !== "00000000-0000-0000-0000-000000000000");
                        this.checkMatchedCRMRecords(this.benefitsOfCompareInsurance);
                    }
                    else {
                        let dialogConfirm: ISubscription = this.confirmDialogService.showModal({
                            title: "Error " + response.data.code,
                            message: "" + response.data.message,
                            btnOkText: "Ok"
                        }).subscribe(() => {
                            dialogConfirm.unsubscribe();
                        });
                    }
                });
        }
    }

    private checkMatchedCRMRecords(records: InsuranceBenefits[]) {
        if (records && records.length > 0) {
            let list = this.benefitsOfSelectedEntity.filter(x => x.matches === true);
            if (list && list.length > 0) {
                for (let i in records) {
                    if (records[i]) {
                        for (let j in list) {
                            if (list[j].crmId === records[i].id) {
                                records[i].matches = true;
                            }
                        }
                    }
                }
            }
        }
    }

    private initAutoComplete(records: Pairs[]) {
        if (records === undefined || records.length === 0) return;

        let self = this;
        $("#tags").autocomplete({
            source(request, response) {
                let results = $.ui.autocomplete.filter(records, request.term);
                response(results.slice(0, 50));
            },
            select(e, ui) {
                self.bindPopUpCRMInfo(ui.item.id);
                self.searchId = ui.item.id;
            }
        });

        $("#tags").autocomplete("option", "appendTo", "#unmatch-group");

    }
    //#endregion
}