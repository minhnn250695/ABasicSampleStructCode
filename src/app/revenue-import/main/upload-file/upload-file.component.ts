import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
// service
import { RevenueImportService } from './../../revenue-import.service';
import { FpStorageService } from './../../../local-storage.service';
import { FfRouterService } from './../../../common/services/ff-router.service';
// dialog
// import { ErrorDialog } from './../../../common/dialog/error-dialog/error-dialog.component';
// utils
import { FileUtils } from './../../../common/utils/FileUtils';
import { BaseComponentComponent } from '../../../common/components/base-component';
import { ConfirmationDialogService } from '../../../common/dialog/confirmation-dialog/confirmation-dialog.service';

declare var $: any;

@Component({
  selector: 'fp-revenue-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.css']
})

export class UploadFileComponent extends BaseComponentComponent implements OnInit, OnDestroy {

  @ViewChild("urlForm") urlForm;
  @ViewChild("dropFileView") dropFileView;

  // variable
  private isOnDestroy = false;

  isMobile: boolean;
  selectedFile: File;
  fileUtils: FileUtils = new FileUtils();
  isRightFormat: boolean = false;
  uploadingFile: boolean = false;

  // flag that indicate file just selected
  isFileJustSelected: boolean = false;

  constructor(
    private crmHandler: RevenueImportService,
    private localStorage: FpStorageService,
    private routerService: FfRouterService,
    private confirmationDialogService: ConfirmationDialogService,
    private mdDialog: MatDialog) {
    super();
  }

  ngOnInit() {
    if (navigator.userAgent.includes("Mobile")) {
      this.isMobile = true;
      $('body').css('padding-top', '0');
    }
    else this.isMobile = false;

    this.isOnDestroy = false;

    this.checkFileAlreadySelected();
  }

  ngOnDestroy() {
    this.clearView();
    this.isOnDestroy = true;
  }

  // on file selected listner
  onFileSelected(event: File) {
    this.selectedFile = event;
    this.isRightFormat = this.fileUtils.isExcelFormat(this.selectedFile.name);

    this.isFileJustSelected = true;
  }

  // on upload click
  onBtnUploadClick() {
    // disable view when upload
    this.disableDropFileView();
    // start upload file
    if (this.selectedFile && this.selectedFile.name.length > 0 && this.isRightFormat) {
      this.uploadWithFile();
    }
  }

  getBtnColor() {
    if (!this.disableUploadbtn()) {
      return "#00BCF2";
    }
    return "#ccc";
  }

  // disable upload btn
  disableUploadbtn(): boolean {
    return !this.isRightFormat || this.uploadingFile;
  }

  //
  // PRIVATE FUNTION
  //
  /**
   * CLEAR drop/pick file view
   */
  private clearDropPickFileView() {
    this.dropFileView.clearSelection();
  }

  private disableDropFileView() {
    this.dropFileView.disableClick(true);
  }

  private clearView() {
    this.selectedFile = null;
    this.isRightFormat = false;
    this.uploadingFile = false;
    // flag that indicate file just selected
    this.isFileJustSelected = false;
    if (this.dropFileView) {
      this.clearDropPickFileView();

      this.dropFileView.disableClick(false);
      this.dropFileView.setLoading(false);
    }
    // this.urlForm.control.valueChanges.subscribe(values => this.onFileUrlChanged(values))
  }

  private checkFileAlreadySelected() {
    let file = this.crmHandler.file;
    if (file && this.dropFileView) {
      this.dropFileView.setSelectedFile(file);
      this.isFileJustSelected = true;
      this.selectedFile = file;
      this.isRightFormat = this.fileUtils.isExcelFormat(file.name);
      this.disableDropFileView();
      this.uploadWithFile();
      this.crmHandler.file = null;
    }
    else {
      this.clearView();
    }
  }

  // upload if selected file valid
  private uploadWithFile() {
    if (this.selectedFile && this.isRightFormat) {
      this.uploadingFile = true;
      this.dropFileView.setLoading(true);
      this.crmHandler.uploadFile(this.selectedFile, this.uploadCallback.bind(this));
    }
  }

  private uploadCallback(error: any, bashId: string) {
    if (this.isOnDestroy) return;
    if (error) {
      let subcription = this.confirmationDialogService.showModal({
        title: "Error #"+ error.errorCode,
        message: error.errorMessage,
        btnOkText: "Close"
      }).subscribe(() => subcription.unsubscribe());
      this.clearView();
      return;
    }
    this.localStorage.saveBashId(bashId);
    this.gotoNextPage();
  }

  private gotoNextPage() {
    this.routerService.gotoCheckProgressPage();
  }
}