import {
    Component, OnInit, Input,
    ViewChild, Output, EventEmitter
} from '@angular/core';
import { FileUtils } from '../../../common/utils/file-utils';


@Component({
    selector: 'app-drop-pick-file',
    templateUrl: './drop-pick-file.component.html',
    styleUrls: ['./drop-pick-file.component.css']
})

export class DropPickFileComponent implements OnInit {

    @Input() title: string;
    @Input() expectedFormat: string[];
    @Input() disableSelectedFile: boolean = false;
    @Input() formatIcon: string;

    @Output() onFileSelected = new EventEmitter();
    @Output() onWrongFileSelected = new EventEmitter();
    @Output() click = new EventEmitter();

    @ViewChild("chooseFile") chooseFile: any;
    @ViewChild("progressBar") progressBar: any;

    isFileSelected: boolean = false;

    // local variable
    private disable: boolean = false;
    private fileName: string = "";
    private isFileCorrectFormat: boolean = true;
    private loading: boolean = false;
    private fileUtils: FileUtils = new FileUtils();

    constructor() { }

    ngOnInit() {
    }



    // if whole container is clicked, we open the select file popup
    onClick() {
        if (this.disableSelectedFile) {
            this.click.emit(null)
        }
        else if (!this.disable) {
            this.chooseFile.nativeElement.click()
        }
    }

    /**
     * on select file changed listener
     * 
     */
    onFileChanged(event: any) {
        let fileList: FileList = event.target.files;
        if (fileList.length == 1) {
            let file: File = fileList.item(0);
            this.checkAndEmitFile(file);
        }
    }

    /**
     * on select file changed listener
     */
    onFileDrop(event: any) {
        let file: File = event;
        this.checkAndEmitFile(file);
    }

    clearSelection() {
        this.fileName = "";
        this.chooseFile.nativeElement.value = null;
        this.isFileCorrectFormat = true;
        this.isFileSelected = false;
        this.loading = false;
        this.disable = false;
    }

    toInputAllowedFileExtension(): string {
        if (!this.expectedFormat) return "";

        let list = this.expectedFormat.slice(0);
        let dotList = list.map((item) => `.${item}`);
        let re = dotList.join(",");
        return re;
    }

    setSelectedFile(file: File) {
        if (file && file.name.length > 0) {
            this.isFileSelected = true;
            this.fileName = file.name;
            this.isFileCorrectFormat = this.fileUtils.isRightFormat(this.fileName, this.expectedFormat);
        }
    }

    setLoading(loading: boolean) {
        this.loading = loading;
        if (!loading && this.progressBar)
            this.progressBar.removeLoading();
    }

    private disableClick(isDisable) {
        this.disable = isDisable;
    }

    private checkAndEmitFile(file: File) {
        this.setSelectedFile(file);
        if (file && file.name.length > 0) {
            if (this.isFileCorrectFormat) {
                this.onFileSelected.emit(file);
            }
            else {
                this.onWrongFileSelected.emit();
            }
        } else {
            this.onWrongFileSelected.emit();
        }
    }
}
