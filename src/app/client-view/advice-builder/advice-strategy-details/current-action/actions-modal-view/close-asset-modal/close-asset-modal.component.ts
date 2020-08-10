import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { CloseAssetActionModel } from '../../../../../models';
import { AdviceBuilderService } from '../../../../advice-builder.service';
declare var $: any;

@Component({
  selector: 'close-asset-view-modal',
  templateUrl: './close-asset-modal.component.html',
  styleUrls: ['./close-asset-modal.component.css'],
})
export class CloseAssetViewModalComponent implements OnInit {

  @Input() closeAsset: CloseAssetActionModel = new CloseAssetActionModel();
  @Input() activeAssetNotClosedList: any[] = [];
  @Input() closedAssetList: any[] = [];
  private selectedAsset = { id: "", name: "", accountBalance: 0 };

  constructor(
    private adviceBuilderService: AdviceBuilderService,
  ) { }


  ngOnInit() {
    // this.selectOnYearTyping = false;
    $('#close-asset-view').on('hidden.bs.modal', () => {
      $('#close-asset-details-view').click();
    });
  }

  ngOnDestroy() {
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('body').removeAttr("style");
  }

  ngOnChanges(changes: SimpleChanges) {
    // check if closed asset need to show destination
    let cloneActiveAsset = JSON.parse(JSON.stringify(this.closedAssetList));
    let updateAction = cloneActiveAsset.filter(asset => asset.id == this.closeAsset.assetId);
    this.selectedAsset = updateAction.length > 0 ? updateAction[0] : {};
  }

  private getClosedAsset() {
    if (!this.closedAssetList || !this.activeAssetNotClosedList) return;
    let closedAssetUpdate = this.defineInsuranceList().filter(asset => asset.id == this.closeAsset.assetId);
    return closedAssetUpdate[0] && closedAssetUpdate[0].name || "N/A";
  }

  private getDestination() {
    if (!this.activeAssetNotClosedList) return;
    let destination = this.activeAssetNotClosedList.filter(asset => asset.id == this.closeAsset.destinationId);
    return destination[0] && destination[0].name || "N/A";
  }

  private defineInsuranceList() {
    // case 1 : it's a close insurance in current year or in the past
    if (this.closeAsset.year <= new Date().getFullYear()) {
      return this.closedAssetList;
    } // case 2: close insurance in the future
    else { return this.activeAssetNotClosedList }
  }
}
