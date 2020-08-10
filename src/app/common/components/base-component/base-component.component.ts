import { ChangeDetectorRef, ViewChild } from '@angular/core';
import { ErrorDialog } from '../../../common/dialog/error-dialog/error-dialog.component';
import { LoadingDialog } from '../../../common/dialog/loading-dialog/loading-dialog.component';
import { ConfigService } from '../../../common/services/config-service';
import { SuccessDialog } from '../../dialog/success-dialog/success-dialog.component';

declare var $: any;
export class BaseComponentComponent {
  @ViewChild("myLoadingSpinner") myLoadingSpinner: LoadingDialog;
  @ViewChild("myErrorDialog") myErrorDialog: ErrorDialog;
  @ViewChild("mySuccessDialog") mySuccessDialog: SuccessDialog;

  baseApiUrl: string;
  isMobile: boolean;

  protected user = JSON.parse(localStorage.getItem("authenticatedUser"));

  private isDestroy: boolean = false;

  constructor(private configService?: ConfigService, private changeDetectorRef?: ChangeDetectorRef) {
    this.baseApiUrl = configService && configService.getApiUrl();
  }


  onBaseInit() {
    this.isDestroy = false;

    this.initPopover();
    this.initTooltip();
    this.checkUsingMobile();
  }

  onBaseDestroy() {
    this.isDestroy = true;
    $('.popover').popover('hide');
  }

  detectChange() {
    if (!this.isDestroy && this.changeDetectorRef) {
      this.changeDetectorRef.detectChanges();
    }
  }

  checkUsingMobile() {
    if (navigator.userAgent.includes("Mobile")) {
      this.isMobile = true;
      $('body').css('padding-top', '0');
    }
    else this.isMobile = false;
  }

  calculateRow(assets: any[], totalColumn: number): number[] {
    if (!assets || totalColumn === 0) {
      return [];
    }

    let length = assets.length;
    let rowNum = Math.ceil(length / totalColumn);
    return Array.apply(null, { length: rowNum }).map(Number.call, Number);
  }

  getForRow(row: number, dataSource: any[], totalColumn: number): any[] {
    if (!dataSource) {
      return [];
    }
    let start = row * totalColumn;
    let stop = start + totalColumn;
    let list = dataSource.slice(start, stop);
    return list ? list : [];
  }

  getImgUrl(imgUrl: string): string {
    if (!imgUrl || imgUrl.length === 0 || imgUrl === 'undefined' || imgUrl === 'null' || imgUrl.includes("default-profile")) {
      return '../../../../assets/img/default-profile.png';
    }
    return this.baseApiUrl + imgUrl;
  }

  showErrorDialog(title?: string, message?: string, subMess?: string, showBtn: boolean = false, goToPage?: string) {
    if (!this.myErrorDialog) return;

    // create new error dialog
    this.myErrorDialog.showErrorDialog(title, message, subMess, showBtn, goToPage);
  }

  /**
   * keep page scroll on top after loading
   */
  scrollTop() {
    $(document).scrollTop(0);
  }

  closeErrorDialog() {
    if (!this.myErrorDialog) return;
    this.myErrorDialog.closeErrorDialog();
  }

  showSuccessDialog(message: string, subMess?: string) {
    if (!this.mySuccessDialog) return;

    this.mySuccessDialog.showSuccessDialog(message, subMess);
  }

  //#region Common components
  initPopover() {
    // set up popover
    $('[rel="popover"]').popover({
      container: 'body',
      html: true,
      trigger: 'manual',
      content() {
        let clone = $($(this).data('popover-content')).clone(true).removeClass('hide');
        return clone;
      },
    });

    // close popover when click outside
    $('html').on('click', (e) => {
      if (!$(e.target).parents().is('.popover.in') && !$(e.target).is('[rel="popover"]') && !$(e.target).parents().is('a')) {
        $('[rel="popover"]').popover('hide');
      }
    });
  }

  destroyPopover() {
    $('[rel="popover"]').popover('destroy');
  }

  initTooltip() {
    $('[data-toggle="tooltip"]').tooltip();
  }

  isMyPopover(e, id, popoverKey): boolean {
    let popoverNum = popoverKey + id;
    let eClassList = e.target.classList;
    if (eClassList instanceof Array) {
      let list = e.target.classList.value;
      return list.indexOf(popoverNum) !== -1;
    }

    let values: string[] = Object.keys(eClassList).map((key) => {
      return eClassList[key];
    });
    return values.indexOf(popoverNum) !== -1;
  }
  //#endregion

  //#region Image functions
  convertBase64ToFile(base64: any, fileName: string, option?: any): any {
    if (base64) {
      let tempBlob: Blob = this.dataURItoBlob(base64);
      return tempBlob;
    } else
      return null;
  }

  /**
   * Convert base64 string to Blob object.
   * @param dataURI
   */
  dataURItoBlob(dataURI) {
    let binary = atob(dataURI.split(',')[1]);
    let array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {
      type: 'image/jpg',
    });
  }
  //#endregion

  //#region General functions
  /**
   * Generate a random string
   */
  createRandomString() {
    let str = "";
    let length = 16;

    for (; str.length < length; str += Math.random().toString(36).substr(2));
    return str.substr(0, length);
  }

  /**
   * Clone an object without effect its source
   * @param src - source object
   */
  cloneObject(src: any) {
    if (src)
      return JSON.parse(JSON.stringify(src));
  }

  /**
   *
   * @param num value to convert to money type
   */
  moneyTranslate(num: any) {
    if (num) {
      num = num.toFixed(2);
      return '$' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return "$0";
  }
  //#endregion

  //#region Table functions
  setupFixedFirstColumnTable() {
    // tslint:disable-next-line:only-arrow-functions
    $(".fixed-column").each(function (i, e) {
      let fixedCol = $(this).clone(true).insertBefore(this);
      fixedCol.addClass("absolute-position");
      $(this).addClass("hidden-table-column");
    });
  }
  //#endregion

  // to be be removed later
  showLoading(isShow: boolean = true) {

    if (this.myLoadingSpinner && isShow) {
      this.myLoadingSpinner.openSpinner();
    }
    else {
      this.myLoadingSpinner.closeSpinner();
    }
  }
}

