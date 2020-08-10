import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { ConfirmationDialogService } from '../../../../common/dialog/confirmation-dialog/confirmation-dialog.service';
import { ErrorCode } from '../../../../common/models/error-code.enum';
import { Pairs } from '../../../../revenue-import/models/pairs.model';
import { DataFeedsBaseComponent } from '../../../data-feeds-base-components.component';
import { DataFeedsStorage } from '../../../data-feeds-storage.service';
import { DataFeedsService } from '../../../data-feeds.service';
import { Entity, Insurance, InsuranceBenefits } from '../../../models';

declare var $: any;
@Component({
    selector: 'app-personal-match',
    templateUrl: './match-records.component.html',
    styleUrls: ['./match-records.component.css']
})
export class PersonalMatchComponent extends DataFeedsBaseComponent implements OnInit, OnDestroy {

    //#region Properties
    @Input("matchList") matchList: Array<Entity<Insurance>>;

    isSelectAll: boolean = false;
    isSearching: boolean = false;
    isManualMatch: boolean = false;
    isValidtoSave: boolean = false;
    isUnlink: boolean = false;
    isLoading: boolean = false;

    selectedEntity: Entity<Insurance> = new Entity<Insurance>();
    informationOfSelectedEntity: Insurance = new Insurance();
    benefitsOfSelectedEntity: InsuranceBenefits[] = [];
    selectedManualMatchRecord: InsuranceBenefits = new InsuranceBenefits();

    compareInsuranceFromCRM: Insurance = new Insurance();
    benefitsOfCompareInsurance: InsuranceBenefits[] = [];
    selectedCRMUnlink: InsuranceBenefits = new InsuranceBenefits();

    private searchId: string;
    //#endregion

    //#region Constructors
    // tslint:disable-next-line:variable-name
    constructor(private dataFeedsService: DataFeedsService, private dataFeedsStorage: DataFeedsStorage, private confirmDialogService: ConfirmationDialogService) {
        super();
    }

    ngOnInit() {
    }
    ngOnDestroy() {
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
        $('body').removeAttr("style");
    }
    //#endregion

    //#region Actions

    onRecordSelectAll(isCheckedAll: boolean) {
        // flag
        this.isSelectAll = !this.isSelectAll;

        this.matchList = this.matchList.map(item => {
            item.isSelected = isCheckedAll;
            return item;
        });
    }

    onRecordSelect(matchRecord: Entity<Insurance>) {

        if (matchRecord.isSelected)
            matchRecord.isSelected = false;
        else
            matchRecord.isSelected = true;

        let selectedRecords = this.matchList.filter(record => record.isSelected === true);

        if (selectedRecords.length > 0)
            this.isSelectAll = true;
        else {
            this.isSelectAll = false;
        }
    }

    btnImportClick() {

        // filter all selected items
        let importList = this.matchList.filter(record => record.isSelected === true);

        // no empty list
        if (importList && importList.length > 0) {
            this.runLoading.emit(true);
            this.importToCRM(importList, 0, importList.length);
        }
    }

    btnMatchingClick(record: Entity<Insurance>) {

        this.resetModal();

        if (!record.information) { return; }

        this.searchId = record.information.crmId;
        if (this.dataFeedsStorage.insurances)
            this.initAutoComplete(this.dataFeedsStorage.insurances);

        this.bindPopUpProviderInfo(record);
        this.bindPopUpCRMInfo(this.searchId);
    }

    // txtSearchChanged() {
    //     let text = $('#txt-tal-match').val().trim();
    //     if (text === "") {
    //         this.resetModal();
    //         this.validateInsuranceBenefits();
    //     }
    // }

    btnSaveClick() {
        // let update = this.updateProvider();
        let update = this.updateInsuranceProvider(this.selectedEntity, this.informationOfSelectedEntity, this.compareInsuranceFromCRM, this.benefitsOfSelectedEntity);

        if (this.isValidtoSave) {
            $('#tal-matched-modal').modal('hide');
            this.runLoading.emit(true);

            let form = this.createMatchedForm(this.selectedEntity);

            this.dataFeedsService.updateMatchedRecords(form).debounceTime(500).subscribe(responseCode => {

                if (responseCode !== 200) {
                    this.reloadData(false);
                    if (responseCode === ErrorCode.MANUAL_MATCH_CONFIRM_OVERWRITE) {
                        $('#tal-match-warning').modal({
                            backdrop: 'static'
                        });
                        $('#tal-match-warning').modal("show");
                        this.reloadData(false);
                    }
                }
                else {
                    this.isSelectAll = false;
                    this.reloadData(true);
                }
            });
        }
    }

    btnYesClick(value: number) {
        if (value) {
            this.runLoading.emit(true);
            let form = this.createMatchedForm(this.selectedEntity, value);
            this.dataFeedsService.updateMatchedRecords(form).debounceTime(500)
                .subscribe(responseCode => {
                    if (responseCode === 200) {
                        this.isSelectAll = false;
                        this.reloadData(true);
                    }
                    else
                        console.log("error");
                });
        }
    }

    btnRefreshClick() {
        if (this.searchId) {
            this.bindPopUpCRMInfo(this.searchId);
        }
    }

    btnCheckClickbtnCheckClick(record: InsuranceBenefits) {
        this.isUnlink = !this.isUnlink;
        if (this.isUnlink === true) {
            this.selectedCRMUnlink = record;
        }
        else {
            this.selectedCRMUnlink = new InsuranceBenefits();
        }
    }

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

                this.checkMatchedCRMRecords(this.benefitsOfCompareInsurance);
                this.isManualMatch = false;
                this.isUnlink = false;
                this.validateInsuranceBenefits();
            }
        }
    }

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

    checkDisable(record: any) {
        if (this.isManualMatch) {
            if (!record.matches && record.externalId === this.selectedManualMatchRecord.externalId)
                return null;
            else
                return "disabled";
        }
        else if (this.isUnlink) {
            if (record.matches && record.crmId === this.selectedCRMUnlink.crmId)
                return null;
            else
                return "disabled";
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

    getPremiumType(type) {
        if (!type) return "";
        else {
            if (type === "Level65" || type === "Level70")
                return "Level";
            else
                return type;
        }
    }

    //#endregion

    //#region Private
    private resetModal() {
        $("#matched-Policy").addClass("active");
        $("#matched-policy").addClass("in active");
        $("#matched-Benefits").removeClass("active");
        $("#matched-benefits").removeClass("in active");
        $('#txt-tal-match').val('');

        this.isSelectAll = false;
        this.isSearching = false;
        this.isValidtoSave = false;
        this.isManualMatch = false;
        this.isUnlink = false;

        this.compareInsuranceFromCRM = new Insurance();
        this.benefitsOfCompareInsurance = [];
        this.matchList.map(item => item.isSelected = false);
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
                        let insurance = response.data.data;
                        this.compareInsuranceFromCRM = insurance;
                        this.benefitsOfCompareInsurance = insurance.benefits.filter(benefit => benefit.id !== "00000000-0000-0000-0000-000000000000");
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

    private validateInsuranceBenefits() {
        // let temp = records.filter(x => !x.crmId)
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

    private checkMatchedCRMRecords(records: InsuranceBenefits[]) {
        let list = this.benefitsOfSelectedEntity.filter(x => x.matches === true);
        for (let i in records) {
            if (i) {
                for (let j in list) {
                    if (list[j].crmId === records[i].id) {
                        records[i].matches = true;
                    }
                }
            }
        }
        // if (records && records.length > 0) {
        //     let list = this.benefitsOfSelectedEntity.filter(x => x.matches === true);
        //     if (list && list.length > 0) {
        // for (let i = 0; i < records.length; i++) {
        //     for (let j = 0; j < list.length; j++) {
        //         if (list[j].crmId === records[i].id) {
        //             records[i].matches = true;
        //         }
        //     }
        // }
        // }
        // }
    }

    private initAutoComplete(records: Pairs[]) {
        if (records === undefined || records.length === 0) return;

        $("#txt-tal-match").autocomplete({
            source: (request, response) => {
                let results = $.ui.autocomplete.filter(records, request.term);
                response(results.slice(0, 50));
            },
            select: (e, ui) => {
                this.bindPopUpCRMInfo(ui.item.id);
                this.searchId = ui.item.id;
            }
        });

        $("#txt-tal-match").autocomplete("option", "appendTo", ".input-group");

    }

    /**
     * cut whole list into smaller pieces
     * call api to import to crm
     * after imported, if success, continue to import another piece with start point + 20
     * stop this process when start point > end point
     *
     * @param importList = selected insurance items
     * @param startPoint = 0 at beginning
     * @param endPoint = length of import list
     */
    private importToCRM(importList: Array<Entity<Insurance>>, startPoint: number, endPoint: number) {

        // check if import all records in waiting list
        if (startPoint > endPoint) {
            this.isSelectAll = false;
            this.reloadData(true);
            return;
        }

        // slice 20 item from import list
        let list = importList.slice(startPoint, startPoint + 20);

        this.dataFeedsService.importInsuranceRecordsToCRM(list).subscribe(response => {

            // check if import all records
            if (this.matchList.filter(record => record.isSelected === false).length === 0)
                this.uploadAll.emit(true);

            // recurse this process if start point still smaller than end point
            this.importToCRM(importList, startPoint + 20, endPoint);

        }, error => {
            console.log("ERROR!!!!");
            console.log(error);
            this.reloadData(true);
        });
    }
    //#endregion
}