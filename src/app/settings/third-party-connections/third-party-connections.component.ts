import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingDialog } from './../../common/dialog/loading-dialog/loading-dialog.component';

// Service
import { ThirdPartyConnectionsService } from './third-party-connections.service';
import { FileUtils } from '../../common/utils/file-utils';

// Models
import { FTPConfig } from './ftpConfig.model';


@Component({
    selector: 'third-party-connections',
    templateUrl: './third-party-connections.component.html',
    styleUrls: ['./third-party-connections.component.css'],
    providers: [ThirdPartyConnectionsService, FileUtils]
})
export class ThirdPartyConnectionsComponent implements OnInit {

    @ViewChild("dropFileView") dropFileView: any;
    @ViewChild('myLoadingSpinner') loadingSpinner: LoadingDialog;
    private originalTALConfig: FTPConfig;
    private selectedFile: File;
    private isRightFormat: boolean;    
    private isNewTALConfig: boolean;
    private TALProviderName: string = 'TAL';

    talConfig: FTPConfig;
    uploadingFile: boolean;

    constructor(private thirdPartyConnectionsService: ThirdPartyConnectionsService, private fileUtils: FileUtils) {
        this.talConfig = new FTPConfig(this.TALProviderName);
    }

    private uploadCertificate(): Promise<string> {
        let promise = new Promise<string>((resolve, reject) => {
            if (!(this.selectedFile && this.selectedFile.name.length > 0 && this.isRightFormat)) {
                resolve(this.talConfig.privateKeyFile);
            }
            else {
                this.uploadingFile = true;
                this.dropFileView.setLoading(true);
                this.dropFileView.disableClick(true);
                this.thirdPartyConnectionsService.uploadCertificate(this.TALProviderName, this.selectedFile)
                    .toPromise()
                    .then(result => {
                        if (result.success) {
                            this.uploadingFile = false;
                            this.dropFileView.clearSelection();
                            this.selectedFile = null;
                        }
                        this.dropFileView.disableClick(false);
                        resolve(result.data);
                    });
            }
        });
        return promise;
    }

    ngOnInit() {
        this.loadingSpinner.closeSpinner();
        this.thirdPartyConnectionsService.getFTPConfig(this.TALProviderName)
            .subscribe(result => {
                this.talConfig = result;
                if (!this.talConfig) {
                    this.talConfig = new FTPConfig(this.TALProviderName);
                    this.isNewTALConfig = true;
                }
            });
    }

    saveTALConfig(): void {
        this.uploadCertificate().then(result => {
            this.talConfig.privateKeyFile = result;
            this.loadingSpinner.openSpinner();
            if (this.isNewTALConfig) {
                this.thirdPartyConnectionsService.postFTPConfig(this.talConfig)
                    .subscribe(result => {
                        if (result.success) {

                        }
                        this.loadingSpinner.closeSpinner();
                    });
            } else {
                this.thirdPartyConnectionsService.putFTPConfig(this.talConfig)
                    .subscribe(result => {
                        if (result.success) {

                        }
                        this.loadingSpinner.closeSpinner();
                    });
            }
        });
    }

    onFileSelected(file: File) {
        this.selectedFile = file;
        this.isRightFormat = this.fileUtils.isPfxFormat(this.selectedFile.name);
        this.talConfig.privateKeyFile = this.selectedFile.name;
    }

    onWrongFileSelected() {
        this.selectedFile = null;
        this.talConfig.privateKeyFile = null;
    }

    isUploadDisabled(): boolean {
        return !this.isRightFormat || this.uploadingFile;
    }

    isSaveDisabled(): boolean {
        return this.uploadingFile || !this.talConfig.privateKeyFile;
    }
}
