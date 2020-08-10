import { Component, Input, OnInit } from '@angular/core';
import { ErrorCode } from '../../../../common/models';
import { Pairs } from '../../../../revenue-import/models';
import { DataFeedsBaseComponent } from '../../../data-feeds-base-components.component';
import { DataFeedsStorage } from '../../../data-feeds-storage.service';
import { DataFeedsService } from '../../../data-feeds.service';
import { ClientData, Entity, PlatFormData } from '../../../models';

declare var $: any;
@Component({
    selector: 'app-hub24-unmatch',
    templateUrl: './hub24-unmatch-records.component.html',
    styleUrls: ['./hub24-unmatch-records.component.css']
})
export class Hub24UnMatchComponent extends DataFeedsBaseComponent implements OnInit {

    // #region Properties
    @Input("unMatchList") unMatchList: Array<Entity<PlatFormData>> = [];

    warningMess: string = "";
    selectedId: string;
    isSelectAll: boolean = false;
    selectedEntity: Entity<PlatFormData> = new Entity<PlatFormData>();
    selectedRecord: PlatFormData = new PlatFormData();
    isSelectAccountName: boolean = false;
    accountName: string;
    isGotAssets: boolean = false;
    isDisableSearchBox: boolean;
    // #endregion

    // #region Constructor
    constructor(private dataFeedsService: DataFeedsService, private dataFeedsStorage: DataFeedsStorage) {
        super();
    }

    ngOnInit() {
        this.selectedRecord.clientData = [];
    }


    ngOnDestroy() {
        this.onRecordSelectAll(false);
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
        $('body').removeAttr("style");
      }
    // #endregion

    // #region Action
    onRecordSelectAll(isCheckedAll: boolean) {
        // flag
        this.isSelectAll = !this.isSelectAll;

        if (this.unMatchList && this.unMatchList.length > 0) {
            this.unMatchList = this.unMatchList.map(item => {
                item.isSelected = isCheckedAll;
                return item;
            });
        }
    }

    onRecordSelect(unMatchRecord: Entity<PlatFormData>) {
        if (unMatchRecord.isSelected)
            unMatchRecord.isSelected = false;
        else
            unMatchRecord.isSelected = true;
        let selectedRecords = this.unMatchList.filter(record => record.isSelected === true);

        if (selectedRecords.length > 0)
            this.isSelectAll = true;
        else {
            this.isSelectAll = false;
        }
    }

    txtSearchChanged() {
        let text = $('#account-name').val().trim();
        if (text === "") {
            this.selectedId = undefined;
            this.isSelectAccountName = false;
        }
    }

    btnMatchingClick(record: Entity<PlatFormData>) {
        this.resetModal();
        if (record) {
            this.selectedEntity = record;
            this.selectedRecord = record.platformData;
            if (this.dataFeedsStorage.assets)
                this.initAutoComplete(this.dataFeedsStorage.assets);
        }
    }

    btnSaveClick() {
        let update = this.updateValues();
        // valid selection
        if (update) {
            $('#match-modal').modal('hide');
            this.runLoading.emit(true);
            this.dataFeedsService.updateClientAssetRecord(this.selectedEntity, null, true)
                .subscribe(responseCode => {
                    if (responseCode === 200) {
                        this.isSelectAll = false;
                        this.reloadData(true);
                    } else if (responseCode === ErrorCode.MANUAL_MATCH_CONFIRM_OVERWRITE) {
                        console.log("duplicated record!!!");
                        $('#hub24-overwrite-warning').modal({
                            backdrop: 'static',
                        });
                        $("#hub24-overwrite-warning").modal();
                        this.reloadData(false);
                    }
                    else {
                        console.log("error");
                        this.reloadData(false);
                    }
                });
        }
    }

    btnYesClick(value: number) {
        if (value) {
            this.runLoading.emit(true);
            this.dataFeedsService.updateClientAssetRecord(this.selectedEntity, value, true)
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
    // #endregion

    // #region Helper
    getClientName(record: PlatFormData) {
        if (record.clientData && record.clientData.length > 0) {
            let clientName = record.clientData[0].firstName + ' ' + record.clientData[0].lastName;
            return clientName !== "" ? clientName : record.clientData[0].organisationName;
        }
    }

    getPlaceHolder(record: PlatFormData) {
        if (!this.dataFeedsStorage.assets) {
            this.isDisableSearchBox = true;
            // this.accountName = "Loading data...";
            return "Loading data...";
        }
        else if (!this.isGotAssets) { // the first time after we got assets then we need to init auto complete
            this.initAutoComplete(this.dataFeedsStorage.assets);
            this.isDisableSearchBox = false;
            this.isGotAssets = true;
        }
        this.accountName = record.accountData && record.accountData.accountName;
        return this.accountName;
    }

    private updateValues(): boolean {

        let selected = this.getSelectedValue();

        if (selected) {
            // update info
            this.selectedEntity.crmId = selected.id;

            return true;
        }
        return false;
    }

    private getSelectedValue(): Pairs {
        let value = this.selectedId;
        if (!value) return null;
        let record = this.dataFeedsStorage.assets.find(x => x.id === value);
        if (record)
            return record;
        return null;
    }

    /**
     * PRIVATE SECTIONS
     *
     */

    private resetModal() {
        this.selectedEntity = new Entity<PlatFormData>();
        this.selectedRecord = new PlatFormData();
        this.isSelectAccountName = false;
        this.selectedId = undefined;
        $('#account-name').val('');
    }

    private initAutoComplete(records: Pairs[]) {
        if (records.length === 0 || records === undefined) {
            console.log("No source found!!");
            return;
        }

        $("#account-name").autocomplete({
            source: (request, response) => {
                let results = $.ui.autocomplete.filter(records, request.term);
                response(results.slice(0, 50));
            },
            select: (e, ui) => {
                this.selectedId = ui.item.id;
                this.isSelectAccountName = true;
            }
        });

        $("#account-name").autocomplete("option", "appendTo", "#unGroup");

    }
    // #endregion
}