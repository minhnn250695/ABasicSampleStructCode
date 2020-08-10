import { Component, OnInit, Input } from '@angular/core';
import { Entity, PlatFormData } from '../../../models';
import { DataFeedsService } from '../../../data-feeds.service';
import { DataFeedsStorage } from '../../../data-feeds-storage.service';
import { DataFeedsBaseComponent } from '../../../data-feeds-base-components.component';
import { Pairs } from '../../../../revenue-import/models';
import { ErrorCode } from '../../../../common/models';

declare var $: any;
@Component({
    selector: 'app-netwealth-unmatch',
    templateUrl: './netwealth-unmatch-records.component.html',
    styleUrls: ['./netwealth-unmatch-records.component.css']
})
export class NetwealthUnMatchComponent extends DataFeedsBaseComponent implements OnInit {

    @Input("unMatchList") unMatchList: Entity<PlatFormData>[] = [];

    warningMess: string = "";
    selectedId: string;
    isSelectAll: boolean = false;
    selectedEntity: Entity<PlatFormData> = new Entity<PlatFormData>();
    selectedRecord: PlatFormData = new PlatFormData();
    isSelectAccountName: boolean = false;
    isGotAssets: boolean = false;
    isDisableSearchBox: boolean;
    accountName: string;
    constructor(private _dataFeedsService: DataFeedsService, private _dataFeedsStorage: DataFeedsStorage) {
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
        let selectedRecords = this.unMatchList.filter(record => record.isSelected == true);

        if (selectedRecords.length == this.unMatchList.length)
            this.isSelectAll = true;
        else {
            this.isSelectAll = false;
        }
    }


    getClientName(record: PlatFormData) {
        if (record.clientData && record.clientData.length > 0) {
            let clientName = record.clientData[0].firstName + ' ' + record.clientData[0].lastName;
            return clientName != "" ? clientName : record.clientData[0].organisationName;
        }
    }

    txtSearchChanged() {
        let text = $('#account-name').val().trim();
        if (text == "") {
            this.selectedId = undefined;
            this.isSelectAccountName = false;
        }
    }

    getPlaceHolder() {
        if (!this._dataFeedsStorage.assets) {
            this.accountName = "Loading data...";
            this.isDisableSearchBox = true;
            this.isGotAssets = false;
        }
        else if (!this.isGotAssets) { // the first time after we got assets then we need to init auto complete
            this.initAutoComplete(this._dataFeedsStorage.assets);
            this.isDisableSearchBox = false;
            this.isGotAssets = true;
            this.accountName = "Account Name";
        }
        return this.accountName;
    }

    btnMatchingClick(record: Entity<PlatFormData>) {
        this.resetModal();
        if (!record.platformData) { return; }
        if (record) {
            this.selectedEntity = record;
            this.selectedRecord = record.platformData;
            if (this._dataFeedsStorage.assets) {
                this.initAutoComplete(this._dataFeedsStorage.assets);
                this.accountName = "Account Name";
            }
        }
    }

    btnSaveClick() {
        let update = this.updateValues();
        // valid selection
        if (update) {
            $('#match-modal').modal('hide');
            this.runLoading.emit(true);
            this._dataFeedsService.updateClientAssetRecord(this.selectedEntity, null, true)
                .subscribe(responseCode => {
                    if (responseCode == 200) {
                        this.isSelectAll = false;
                        this.reloadData(true);
                    } else if (responseCode == ErrorCode.MANUAL_MATCH_CONFIRM_OVERWRITE) {
                        $('#netwealth-overwrite-warning').modal({
                            backdrop: 'static',
                        });
                        $("#netwealth-overwrite-warning").modal();
                        this.reloadData(false);
                    }
                    else {
                        console.log("error")
                        this.reloadData(false);
                    }
                });
        }
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
        let record = this._dataFeedsStorage.assets.find(x => x.id == value);
        if (record)
            return record;
        return null;
    }

    /**
* PRIVATE SECTIONS 
* 
*/
    btnYesClick(value: number) {
        if (value) {
            this.runLoading.emit(true);
            this._dataFeedsService.updateClientAssetRecord(this.selectedEntity, value, true)
                .subscribe(responseCode => {
                    if (responseCode == 200) {
                        this.isSelectAll = false;
                        this.reloadData(true);
                    }
                    else
                        console.log("error")
                });
        }
    }

    private resetModal() {
        this.selectedEntity = new Entity<PlatFormData>();
        this.selectedRecord = new PlatFormData();
        this.isSelectAccountName = false;
        this.selectedId = undefined;
        $('#account-name').val('');
    }

    private initAutoComplete(records: Pairs[]) {
        if (records.length == 0 || records == undefined) {
            console.log("No source found!!")
            return;
        }

        let self = this;
        $("#account-name").autocomplete({
            source: function (request, response) {
                var results = $.ui.autocomplete.filter(records, request.term);
                response(results.slice(0, 50));
            },
            select: function (e, ui) {
                self.selectedId = ui.item.id;
                self.isSelectAccountName = true;
            }
        });

        $("#account-name").autocomplete("option", "appendTo", "#unGroup");

    }
}