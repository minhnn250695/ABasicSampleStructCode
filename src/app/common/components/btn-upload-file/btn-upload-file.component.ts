import { Component, OnInit, Input, Output, ViewChild, EventEmitter } from '@angular/core';

declare var $: any;
@Component({
  selector: 'btn-upload-file',
  templateUrl: './btn-upload-file.component.html',
  styleUrls: ['./btn-upload-file.component.css']
})
export class BtnUploadFileComponent implements OnInit {
  @Input('placeHolder') placeHolder: string;
  @Input('expectedFormat') expectedFormat: string[];
  @Input('customClass') customClass: string;
  @Input('isTheSecondInput') isTheSecondInput: boolean;
  @Output('fileChange') fileChangeEvent: EventEmitter<File> = new EventEmitter();
  @ViewChild("chooseFile") chooseFile: any;
  usingTwoTimes: boolean = false;

  ngOnInit() {
    this.usingTwoTimes = this.isTheSecondInput ? this.isTheSecondInput : false;
  }

  reset() {    
    if (!this.isTheSecondInput)
      $("#btnChooseFile1").val("");
    else
      $("#btnChooseFile2").val("");
  }

  btnClick() {
    if (!this.isTheSecondInput)
      $("#btnChooseFile1").click();
    else
      $("#btnChooseFile2").click();

  }

  /**
   * on select file changed listener
   *
   */
  onFileChanged(event: any) {
    let fileList: FileList = event.target.files;
    if (fileList.length == 1) {
      let file: File = fileList.item(0);
      this.fileChangeEvent.emit(file);
    }
  }

  toInputAllowedFileExtension(): string {
    if (!this.expectedFormat) return "";

    let list = this.expectedFormat.slice(0);
    let dotList = list.map((item) => `.${item}`);
    let re = dotList.join(",");
    return re;
  }
}
