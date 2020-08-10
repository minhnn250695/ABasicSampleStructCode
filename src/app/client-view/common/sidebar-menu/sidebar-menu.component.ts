import {
  Component, Input, OnDestroy,
  OnInit, SimpleChanges, Output, EventEmitter, ViewChild

} from '@angular/core';
import { ClientAsset, ClientDebt } from '../../models';

declare var $: any;
@Component({
  selector: 'sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.css'],
})
export class SideBarMenuComponent implements OnInit, OnDestroy {
  @Input() listItems: any[] = [];
  @Input() objectValue: any;
  @Input() listOwner = [];
  @Input() itemTypes = [];
  @Input() isMobile: boolean = false;
  @Output() selectedItems: EventEmitter<any> = new EventEmitter();
  // For Mobile
  @ViewChild('drawer') drawer;
  private showSideBar: boolean = false;

  private selectedOwner: string = "-1";
  private currentItem: number = 0;
  private selectedType: string = "-1";
  private listItems_view: any[] = [];
  private listOwner_view: any[] = [];
  constructor() {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.listItems && changes.listItems.currentValue) {
      this.listItems_view = this.listItems;
      // combine name with product provider name
      if (this.objectValue.type == 3) { // insurance
        this.listItems_view.forEach(item => {
          item.combineInsuranceName = this.getInsuranceName(item);
        });
      }
      // calculate amount of items
      this.calculateAmountOfItem();
    }
    if (changes.listOwner && changes.listOwner.currentValue) {
      this.listOwner_view = JSON.parse(JSON.stringify(this.listOwner));
      // calculate amount of items
      this.calculateAmountOfItem();
    }    
  }

  ngOnDestroy() {
  }

  private checkSelectedItem(index: number) {
    this.currentItem = index;
    this.selectedItems.emit(this.listItems_view[index]);
  }

  private selectTypeChange(event: any) {
    if (this.objectValue.type == 1) { // asset
      this.filterAssetListItems(this.selectedType, this.selectedOwner);
    } else if (this.objectValue.type == 2) {//debt
      this.filterDebtListItems(this.selectedType, this.selectedOwner);
    } else if (this.objectValue.type == 3) {// insurance
      this.filterInsuranceListItems(this.selectedType, this.selectedOwner);
    }
  }

  private selectOwnerChange(event: any) {
    if (this.objectValue.type == 1) { // asset
      this.filterAssetListItems(this.selectedType, this.selectedOwner);
    } else if (this.objectValue.type == 2) { //debt
      this.filterDebtListItems(this.selectedType, this.selectedOwner);
    } else if (this.objectValue.type == 3) { // insurance
      this.filterInsuranceListItems(this.selectedType, this.selectedOwner);
    }
  }

  private getInsuranceName(insuranceDetails) {
    if (!insuranceDetails.productProviderName || !insuranceDetails.number || !insuranceDetails.name)
      return 'N/A';
    let name = `${insuranceDetails.productProviderName} / ${insuranceDetails.number} / ${insuranceDetails.name}`;
    return name;
  }

  private filterAssetListItems(assetType: string, ownerID: string) {
    let tempListItem = JSON.parse(JSON.stringify(this.listItems));
    if (!tempListItem || tempListItem.length == 0 || null) { this.listItems_view = []; return; };

    if (assetType == "-1" && ownerID == "-1") { // showing all items
      this.listItems_view = this.listItems;
    } else if (assetType == "-1" && ownerID != "-1") {// asset type is select all and owner ID is not selected all
      this.listItems_view = tempListItem.filter(item => item.primaryClientId == ownerID);
    } else if (assetType != "-1" && ownerID == "-1") {// asset type is not select all and owner ID is selected all
      this.listItems_view = tempListItem.filter(item => item.assetType == assetType);
    } else if (assetType != "-1" && ownerID != "-1") { // asset type and owner ID are not selected all
      this.listItems_view = tempListItem.filter(item => item.assetType == assetType && item.primaryClientId == ownerID);
    }
    if (!this.isMobile) {
      // reload selected item
      if (this.listItems_view && this.listItems_view.length > 0) {
        this.checkSelectedItem(0);
      } else {
        this.selectedItems.emit(new ClientAsset());
      }
    }
  }

  private filterDebtListItems(debtType: string, ownerID: string) {
    let tempListItem = JSON.parse(JSON.stringify(this.listItems));
    if (!tempListItem || tempListItem.length == 0 || null) { this.listItems_view = []; return; };

    if (debtType == "-1" && ownerID == "-1") { // showing all items
      this.listItems_view = this.listItems;
    } else if (debtType == "-1" && ownerID != "-1") {// asset type is select all and owner ID is not selected all
      this.listItems_view = tempListItem.filter(item => item.primaryClientId == ownerID);
    } else if (debtType != "-1" && ownerID == "-1") {// asset type is not select all and owner ID is selected all
      this.listItems_view = tempListItem.filter(item => item.debtType == debtType);
    } else if (debtType != "-1" && ownerID != "-1") { // asset type and owner ID are not selected all
      this.listItems_view = tempListItem.filter(item => item.debtType == debtType && item.primaryClientId == ownerID);
    }

    if (!this.isMobile) {
      // reload selected item
      if (this.listItems_view && this.listItems_view.length > 0) {
        this.checkSelectedItem(0);
      } else {
        this.selectedItems.emit(new ClientDebt());
      }
    }
  }

  private filterInsuranceListItems(debtType: string, ownerID: string) {
    let tempListItem = JSON.parse(JSON.stringify(this.listItems || null));
    if (!tempListItem || tempListItem.length == 0 || null) { this.listItems_view = []; return; };

    if (debtType == "-1" && ownerID == "-1") { // showing all items
      this.listItems_view = this.listItems;
    } else if (debtType == "-1" && ownerID != "-1") {// asset type is select all and owner ID is not selected all
      this.listItems_view = tempListItem.filter(item => item.primaryClientId == ownerID);
    } else if (debtType != "-1" && ownerID == "-1") {// asset type is not select all and owner ID is selected all
      this.listItems_view = tempListItem.filter(item => item.debtType == debtType);
    } else if (debtType != "-1" && ownerID != "-1") { // asset type and owner ID are not selected all
      this.listItems_view = tempListItem.filter(item => item.debtType == debtType && item.primaryClientId == ownerID);
    }

    if (!this.isMobile) {
      // reload selected item
      if (this.listItems_view && this.listItems_view.length > 0) {
        this.checkSelectedItem(0);
      } else {
        this.selectedItems.emit(new ClientDebt());
      }
    }

  }

  private calculateAmountOfItem() {
    if (this.listOwner_view && this.listItems) {
      this.listOwner_view.forEach(owner => {
        let counter = this.listItems.filter(item => item.primaryClientId == owner.id);
        owner.fullName = owner.fullName + " (" + counter.length + ")";
      });

    }
  }

  /** ================================================================
     *                      SIDEBAR HANDLER
     ===================================================================*/

  private onSelect(index: number) {
    this.openSideBar();
  }

  private openSideBar() {
    this.drawer.open();
    this.showSideBar = true;
    $('body').css('overflow-y', 'hidden');
    $('body').addClass('stop-scrolling');
    $('body').bind('touchmove', function (e) { e.preventDefault() });
  }

  private closeSideBar() {
    $('body').css('overflow-y', 'auto');
    $('body').removeClass('stop-scrolling');
    $('body').unbind('touchmove');
    this.drawer.close();
    this.showSideBar = false;
  }

}
