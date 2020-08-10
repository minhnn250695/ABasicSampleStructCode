import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Http, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs';

import { FileFolderEntity } from './models';
//services
import { ConfigService } from '../../common/services/config-service';

@Injectable()
export class DocStorageService {
  private fileFolderEntities: Map<string, FileFolderEntity>;
  private companyPattern: string;
  private companyId: string;

  constructor(private httpClient: HttpClient,
    private http: Http,
    private configService: ConfigService) {
    this.companyId = this.configService.companyId();
    this.fileFolderEntities = new Map<string, FileFolderEntity>();
  }

  /**
   * get all files/sub-folders at specified folder
   * @param householdId 
   * @param atFolder 
   */
  getClientDocuments(householdId: string, atFolder: string = "", forceGet: boolean = true): Observable<FileFolderEntity> {
    // check cache
    let cached = this.fileFolderEntities.get(atFolder);

    let apiUrl = `api/companies/${this.companyId}/users/ClientDocuments/${householdId}`;
    let data = { PathFolder: atFolder }
    return this.httpClient.post<FileFolderEntity>(apiUrl, data).map(res => {
      return res;
    });
  }

  /**
   * upload file
   * @param householdId 
   * @param file 
   * @param atFolder 
   */
  uploadFileToFolder(householdId: string, file: File, atFolder: string = "") {
    let apiUrl = `api/companies/${this.companyId}/users/ClientDocuments/${householdId}/UploadFile`;
    let formData = new FormData()
    formData.append('PathFolder', atFolder)
    formData.append('files', file, file.name);

    return this.http.post(this.configService.getApiUrl() + apiUrl, formData, { headers: this.configService.getHeaders() }).map(res => {
      return res;
    });
  }

  createFolder(householdId: string, folderPath: string, folderName: string) {
    let apiUrl = `api/companies/${this.companyId}/users/ClientDocuments/${householdId}/CreateFolder`

    let folder = folderPath.length == 0 ? "" : folderPath + "/";

    let data = { PathFolder: `${folder}${folderName}` }
    return this.httpClient.post(apiUrl, data).map(res => {
      return res;
    })
  }
  /**
   * 
   * @param householdId 
   * @param fileName 
   * @param atFolder 
   */
  deleteFileAtFolder(householdId: string, fileName: string, atFolder: string = "") {
    // [HttpPost("api/users/ClientDocuments/{householdId}/Delete/{documentName}")]
    let apiUrl = `api/companies/${this.companyId}/users/ClientDocuments/${householdId}/Delete/`;

    let data = { PathFolder: atFolder, FileName: fileName };
    return this.httpClient.post(apiUrl, data).map(res => {
      return res;
    })
  }

  /**
   * 
   * @param householdId 
   * @param fileName 
   * @param atFolder 
   */
  deleteFolder(householdId: string, folderName: string) {
    // [HttpPost("api/users/ClientDocuments/{householdId}/Delete/{documentName}")]
    if (!folderName) {
      return Observable.of(null);
    }
    let apiUrl = `api/companies/${this.companyId}/users/ClientDocuments/${householdId}/Delete`

    let data = { PathFolder: folderName }
    return this.httpClient.post(apiUrl, data).map(res => {
      return res;
    })
  }

  deleteMultipleFileFolders(householdId: string, farentPathFolder: string, folderOrFilePath: string[]) {
    if (!folderOrFilePath || folderOrFilePath && folderOrFilePath.length == 0) {
      return Observable.of(null);
    }
    let apiUrl = `api/companies/${this.companyId}/users/ClientDocuments/${householdId}/Delete`;
    let value = folderOrFilePath.join(";");
    let data = { ParentPathFolder: farentPathFolder, PathFolder: value }

    return this.httpClient.post(apiUrl, data).map(res => {
      return res;
    })
  }

  /**
   * 
   * @param householdId 
   * @param fileName 
   * @param atFolder 
   */
  downloadFile(householdId: string, folderPath: string, documentName: string) {
    let apiUrl = `api/companies/${this.companyId}/users/ClientDocuments/${householdId}/Download/${documentName}`
    let data = { PathFolder: folderPath }

    return this.http.post(this.configService.getApiUrl() + apiUrl, data, { responseType: ResponseContentType.Blob, headers: this.configService.getHeaders() }).map(res => {
      return res;
    });
  }

  downloadPDF(householdId: string, folderPath: string, documentName: string) {
    let apiUrl = `api/companies/${this.companyId}/users/ClientDocuments/${householdId}/Download/${documentName}`;
    let data = { PathFolder: folderPath }
    return this.http.post(this.configService.getApiUrl() + apiUrl, data, {
      responseType: ResponseContentType.ArrayBuffer, headers: this.configService.getHeaders()
    }).map((res) => {
      return new Blob([res.blob()], { type: 'application/pdf' })
    })
  }

  downloadMultipleFileFolders(householdId: string, folderOrFilePath: string[]) {
    if (!folderOrFilePath || folderOrFilePath && folderOrFilePath.length == 0) {
      return Observable.of(null);
    }

    let apiUrl = `api/companies/${this.companyId}/users/ClientDocuments/${householdId}/DownloadZip`;

    let value = folderOrFilePath.join(";");
    let data = { PathFolder: value };
    return this.http.post(this.configService.getApiUrl() + apiUrl, data, { responseType: ResponseContentType.Blob, headers: this.configService.getHeaders() }).map(res => {
      return res;
    })
  }
}
