import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FileUtils } from '../../common/utils/file-utils';
import { UploadTemplateService } from './upload-template.service';
import { TemplateManagerService } from '../template-manager/template-manager.service';
import { Template } from '../template-manager/template.model';

declare var $: any;
@Component({
    selector: 'upload-template',
    templateUrl: './upload-template.component.html',
    styleUrls: ['./upload-template.component.css'],
    providers: [UploadTemplateService, FileUtils]
})

export class UploadTemplateComponent implements OnInit {

    @ViewChild("dropFileView") dropFileView: any;
    private selectedFile: File;
    private isRightFormat: boolean;
    private uploadingFile: boolean;
    private uploadingUrlLink: boolean;
    private isFileJustSelected: boolean;

    isMobile: boolean;

    constructor(private fileUtils: FileUtils, private uploadTemplateService: UploadTemplateService, private templateManagerService: TemplateManagerService, private router: Router) {
    }

    ngOnInit(): void {
        if (navigator.userAgent.includes("Mobile")) {
            this.isMobile = true;
            $('body').css('padding-top', '0');
        }
        else this.isMobile = false;

        this.templateManagerService.getDocumentGeneratorConfig().subscribe();
    }

    // if whole container is clicked, we open the select file popup
    onDropViewClick() {
    }

    onFileSelected(file: File) {
        this.selectedFile = file;
        this.isRightFormat = this.fileUtils.isWordFormat(this.selectedFile.name);
        this.isFileJustSelected = true;
    }

    isUploadDisabled(): boolean {
        return !this.isRightFormat || this.uploadingUrlLink || this.uploadingFile;
    }

    upload(): void {
        if (this.selectedFile && this.selectedFile.name.length > 0 && this.isRightFormat) {
            this.uploadWithFile();
        }
    }

    // upload if selected file valid
    private uploadWithFile() {
        if (this.selectedFile && this.isRightFormat) {
            this.uploadingFile = true;
            this.dropFileView.setLoading(true);
            this.dropFileView.disableClick(true);
            this.uploadTemplateService.uploadFile(this.selectedFile).subscribe(result => {
                if (result.success) {
                    this.uploadingFile = false;
                    this.dropFileView.clearSelection();
                    this.selectedFile = null;
                    this.editTemplate(result.data);
                }
                this.dropFileView.disableClick(false);
            });
        }
    }

    private editTemplate(template: Template) {
        this.templateManagerService.selectTemplate(template);
        this.router.navigate(["document/template-editor"]);
    }

    private clearView() {
        this.selectedFile = null;
        this.isRightFormat = false;
        this.uploadingUrlLink = false;
        this.uploadingFile = false;
        this.isFileJustSelected = false;
        this.dropFileView.clearSelection();
        this.dropFileView.disableClick(false);
        this.dropFileView.setLoading(false);
    }
}