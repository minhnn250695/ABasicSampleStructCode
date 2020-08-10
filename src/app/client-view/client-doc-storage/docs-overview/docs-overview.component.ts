import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { saveAs as importedSaveAs } from 'file-saver';
import { FileUtils, RxUtils } from '../../../common/utils';
import { enableDebugTools } from '@angular/platform-browser/src/browser/tools/tools';
import { Observable } from 'rxjs';
import { ISubscription } from 'rxjs/Subscription';

// Entity
import { FileFolderEntity } from '../models';
import { UserAccount } from '../../../third-party/models';

// Component
import { BaseComponentComponent } from '../../../common/components/base-component/base-component.component';

// services
import { ClientViewService } from '../../client-view.service';
import { DocStorageService } from '../doc-storage.service';
import { ConfigService } from '../../../common/services/config-service';
import { SecurityService } from '../../../security/security.service';

declare var $: any;

@Component({
  selector: 'app-docs-overview',
  templateUrl: './docs-overview.component.html',
  styleUrls: ['./docs-overview.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsOverviewComponent extends BaseComponentComponent implements OnInit, OnDestroy {
  private rxUtils: RxUtils = new RxUtils();
  private fileUtils: FileUtils = new FileUtils();
  private curentFolderEntity: FileFolderEntity;
  private childrenFileFolders: FileFolderEntity[];
  private houseHoldId: string;
  private selectedEntities: FileFolderEntity[] = [];
  private navigatePathList: string[] = [];
  private isSelectedAll: boolean = false;
  private searchText: string = '';
  private currentLayoutView: string = 'list';
  private showFileSizeCol: boolean = false;
  private sortedField: string = 'name';
  private iSub: ISubscription;
  loginUser: UserAccount = new UserAccount();

  @ViewChild("chooseFile") chooseFile: any;

  constructor(private clientViewService: ClientViewService,
    private docStorageService: DocStorageService,
    private securityService: SecurityService,
    configService: ConfigService,
    changeDetectorRef: ChangeDetectorRef) {
    super(configService, changeDetectorRef)
  }

  ngOnInit() {
    // run set-up
    super.onBaseInit();
    this.loginUser = JSON.parse(localStorage.getItem("authenticatedUser"));
    this.clientViewService.showLoading();
    this.clientViewService.houseHoldObservable.subscribe(res => {
      if (res && res.id) {
        this.houseHoldId = res.id;
        // get client documents
        this.getClientDocuments(this.curentFolderEntity && this.curentFolderEntity.pathFolder || "");
      }
    });
  }

  ngOnDestroy() {
    this.onBaseDestroy();

    this.rxUtils.clear();
  }

  isClientAccess() {
    return this.securityService.isClient();
  }

  canModified(item: FileFolderEntity) {
    if (item) {
      if (item.name == "Miscellaneous" || item.parentPathFolder == "Miscellaneous" || item.pathFolder.includes("Miscellaneous"))
        return true;
    }
    return false;
  }

  navigatePathSelecting(name: string): boolean {
    if (name == "root" && this.navigatePathList.length == 0) {
      return true;
    }
    if (this.curentFolderEntity.name == name) {
      return true;
    }
    return false;
  }

  navigateToFolder(currentFolderName: string) {
    // get 
    let currentFolderPath = "";
    let index = this.navigatePathList.indexOf(currentFolderName);
    this.isSelectedAll = false;
    for (let i = 0; i <= index; i++) {
      currentFolderPath += this.navigatePathList[i] + '\\';
    }
    this.getClientDocuments(currentFolderPath, false);
  }

  /**
   * VIEW ACTION
   */

  private getClientDocuments(folder: string = "", forceGet: boolean = true) {
    // get client documents
    this.clientViewService.showLoading();
    let sub = this.docStorageService.getClientDocuments(this.houseHoldId, folder, forceGet).subscribe(res => {
      this.curentFolderEntity = res;
      this.childrenFileFolders = res && res.childrenFileFolders;
      this.updateNavigatePath(this.curentFolderEntity);
      this.checkToShowFileSizeColumn();
      this.sortByField();

      this.clientViewService.hideLoading();
      this.detectChange();
    }, err => {
      this.clientViewService.hideLoading();
    });

    this.rxUtils.addSubscription(sub);
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

  /**
   * ITEM CLICK
   */

  private fileFolderItemClick(entity: FileFolderEntity) {
    this.isSelectedAll = false;
    if (!entity || entity && entity.isFolder == false) {
      return;
    }

    // get entities inside the new folder
    this.getClientDocuments(entity && entity.pathFolder || "", false);
  }

  private itemSelectedClick(entity: FileFolderEntity) {

    this.childrenFileFolders = this.childrenFileFolders && this.childrenFileFolders.map(item => {
      if (item.name == entity.name) {

        let isChecked = item.isSelected;
        item.isSelected = !isChecked;
      }
      return item;
    });

    this.detectChange();
  }

  /**
   * select all click
   */
  private selectAllClick() {
    this.childrenFileFolders = this.childrenFileFolders && this.childrenFileFolders.map(item => {
      item.isSelected = true;
      return item;
    });
    this.isSelectedAll = true;
    this.detectChange();
  }

  /**
   * deselect all click
   */
  private deselectAllClick() {
    this.childrenFileFolders = this.childrenFileFolders && this.childrenFileFolders.map(item => {
      item.isSelected = false;
      return item;
    });
    this.isSelectedAll = false;
    this.detectChange();
  }

  private selectDeselectAllClick() {
    if (this.isSelectedAll)
      this.deselectAllClick();
    else
      this.selectAllClick();
  }

  /**
   * delete selected items
   */
  private deleteSelectedClick() {

    // show warning first
    let deleteItems = this.getSelectedItems();
    if (deleteItems && deleteItems.length > 0) {
      $('#deleteWarningModal').modal('show');
      this.selectedEntities = deleteItems;
    }
  }

  // delete action
  private deleteItemClick(entity: FileFolderEntity) {
    // show warning first
    this.selectedEntities.push(entity);
    $('#deleteWarningModal').modal('show');
  }

  /**
   * download selected items
   */
  private downloadSelectedClick() {
    let list = this.childrenFileFolders.filter(folder => folder.isSelected);
    list.forEach(item => this.downloadItemClick(item));
    this.resetAllData();
  }

  private getSelectedItems() {
    let items = this.childrenFileFolders && this.childrenFileFolders.filter(item => item.isSelected)
    return items;
  }

  private getSelectedFileFolderPaths(): string[] {
    let fileAndFolders = this.childrenFileFolders &&
      this.childrenFileFolders.filter(item => item.isSelected)
        .map(item => {
          let result = (!item.parentPathFolder || item.parentPathFolder && item.parentPathFolder.length == 0)
            ? "" : `${item.parentPathFolder}/`;
          return result + item.name;
        });

    return fileAndFolders;
  }

  /**
   *  new folder modal
   */
  private newFolderModelSaveChange() {
    let folderName: string = $('#txtFolderName').val();

    // hide modal and clear input
    if (folderName && folderName.trim().length > 0) {
      $('#newFolderModal').modal('hide');
      $('#txtFolderName').val("");

      this.createFolderInServer(folderName);
    }
  }

  // upload file
  private uploadFileClick() {
    this.chooseFile.nativeElement.click()
  }

  private onFileChanged(event: any) {
    let fileList: FileList = event && event.target && event.target.files;

    if (fileList && fileList.length == 1) {
      let file: File = fileList.item(0);
      // clear input
      $("#selectFile").val("")
      this.uploadFileToServer(file, this.curentFolderEntity.pathFolder);
    }
  }

  private deleteItem(entity): Observable<any> {
    if (!entity) { return Observable.of(null); }
    if (entity.isFolder) {
      return this.deleteFolderInServer(entity);
    } else {
      return this.deleteFileInServer(entity);
    }
  }

  private btnConfirmDeleteClick(isDelete: boolean) {
    $('#deleteWarningModal').modal('hide');

    if (isDelete) {
      if (!this.selectedEntities || this.selectedEntities.length < 1) return;

      let observables: Observable<any>[] = [];

      this.selectedEntities.forEach(entity => {
        // push all request delete item to observable array.
        observables.push(this.deleteItem(entity));
      })

      // zip all delete items and send to server.
      this.iSub = Observable.zip.apply(null, observables).subscribe(res => {
        if (this.iSub) {
          this.iSub.unsubscribe();
        }
        if (res) {
          this.getClientDocuments(this.curentFolderEntity && this.curentFolderEntity.pathFolder || "");
          this.resetDelete();
        }
      }, err => {
        console.log(err);
        this.clientViewService.hideLoading();
      });

    }
    else {
      this.resetDelete();
    }
  }

  private resetDelete() {
    this.selectedEntities = [];
    // this.isDeleteFinish = false;
  }

  // download action
  private downloadItemClick(entity: FileFolderEntity) {
    if (!entity) { return; }

    if (entity.isFolder) {
      this.downloadFolderInServer(entity);
    } else {
      this.downloadFileInServer(entity);
    }
  }

  private updateNavigatePath(folder: FileFolderEntity) {
    if (!folder || !folder.pathFolder) {
      this.navigatePathList = [];
    }
    if (folder && folder.pathFolder) {
      this.navigatePathList = folder.pathFolder.split("\\");
    }
  }

  private checkToShowFileSizeColumn() {
    for (var i = 0; i < this.childrenFileFolders.length; i++) {
      this.showFileSizeCol = false;
      if (!this.childrenFileFolders[i].isFolder) {
        this.showFileSizeCol = true;
        break;
      }
    }
  }

  private sortByField() {
    this.childrenFileFolders.sort((a, b) => {
      let nameA = a[this.sortedField].toUpperCase();
      let nameB = b[this.sortedField].toUpperCase();
      if (nameA < nameB)
        return -1;
      if (nameA > nameB)
        return 1;
      return 0;
    })
  }

  private resetAllData() {
    this.isSelectedAll = false;
    this.deselectAllClick();
  }

  /**
   * REQUEST
   */
  /**
   * 
   * @param file 
   * @param folder 
   */
  private uploadFileToServer(file: File, folderPath: string = "") {
    this.clientViewService.showLoading();
    this.docStorageService.uploadFileToFolder(this.houseHoldId, file, folderPath)
      .subscribe(res => {
        this.getClientDocuments(this.curentFolderEntity && this.curentFolderEntity.pathFolder || "");
      }, err => {
        this.clientViewService.hideLoading();
      });
  }

  private createFolderInServer(folderName: string) {
    if (!folderName || folderName && folderName.length == 0) {
      return;
    }

    this.clientViewService.showLoading();
    let folderNamePath = this.curentFolderEntity.name || ""
    this.docStorageService.createFolder(this.houseHoldId, this.curentFolderEntity.pathFolder || "", folderName)
      .subscribe(res => {
        this.getClientDocuments(this.curentFolderEntity && this.curentFolderEntity.pathFolder || "");
      }, err => {
        this.clientViewService.hideLoading();
      });
  }



  /**
   * DELETE STUFF
   * 
   */
  private deleteFolderInServer(entity: FileFolderEntity): Observable<any> {
    if (!entity || entity && entity.isFolder == false) {
      return Observable.of(null);
    }

    this.clientViewService.showLoading();
    return this.docStorageService.deleteFolder(this.houseHoldId, entity.pathFolder);
  }

  private deleteFileInServer(entity: FileFolderEntity): Observable<any> {
    if (!entity || entity && entity.isFolder == true) {
      return Observable.of(null);
    }

    this.clientViewService.showLoading();
    return this.docStorageService.deleteFileAtFolder(this.houseHoldId, entity.name, this.curentFolderEntity.pathFolder)
  }

  private deleteMutipleFiles(docs: string[]) {
    if (!docs || docs && docs.length == 0) {
      return;
    }

    this.clientViewService.showLoading();
    let parentPath = this.curentFolderEntity && this.curentFolderEntity.parentPathFolder;
    this.docStorageService.deleteMultipleFileFolders(this.houseHoldId, parentPath, docs)
      .subscribe(res => {
        // load data again
        this.getClientDocuments(this.curentFolderEntity && this.curentFolderEntity.pathFolder || "");
      }, err => {
        this.clientViewService.hideLoading();
      });
  }

  /**
   * DOWNLOAD STUFF
   */
  private downloadFileInServer(entity: FileFolderEntity) {
    if (!entity || entity && entity.isFolder == true) {
      return;
    }

    this.clientViewService.showLoading();
    if (entity.name.includes(".pdf")) {
      this.docStorageService.downloadPDF(this.houseHoldId, this.curentFolderEntity.pathFolder,
        entity.name).subscribe(
          (res) => {
            this.clientViewService.hideLoading();
            importedSaveAs(res, entity.name); //if you want to save it - you need file-saver for this : https://www.npmjs.com/package/file-saver

            var fileURL = URL.createObjectURL(res);
            window.open(fileURL); // if you want to open it in new tab
          })
    }
    else {
      this.docStorageService.downloadFile(this.houseHoldId, this.curentFolderEntity.pathFolder,
        entity.name)
        .subscribe(res => {
          this.clientViewService.hideLoading();

          importedSaveAs(res.blob(), entity.name)
        }, err => {
          this.clientViewService.hideLoading();
        });
    }
  }

  private downloadFolderInServer(entity: FileFolderEntity) {
    if (!entity || entity && entity.isFolder == false) {
      return;
    }
    let result = (!entity.parentPathFolder || entity.parentPathFolder && entity.parentPathFolder.length == 0)
      ? "" : `${entity.parentPathFolder}/`;
    result = result + entity.name;

    this.downloadMutipleFiles([result], `${entity.name}.zip`);
  }

  /**
   * 
   * @param docs list of file/folder full path
   */
  private downloadMutipleFiles(docs: string[], expectedFileName: string) {
    if (!docs || docs && docs.length == 0) {
      return;
    }

    this.clientViewService.showLoading();
    this.docStorageService.downloadMultipleFileFolders(this.houseHoldId, docs)
      .subscribe(res => {
        this.clientViewService.hideLoading();
        importedSaveAs(res.blob(), expectedFileName)
      }, err => {
        this.clientViewService.hideLoading();
      });
  }

  /**
   * VIEW STUFF
   */

  /**
   * @param layout
   */
  private changeLayoutView(layout: string) {
    if (layout == 'icon') {
      this.currentLayoutView = 'icon';
    }
    else {
      this.currentLayoutView = 'list';
    }
  }

}
