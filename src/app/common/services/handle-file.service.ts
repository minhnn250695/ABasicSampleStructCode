import { Injectable } from '@angular/core';

@Injectable()
export class HandleFileService {

  constructor() { }

  /**
   * save file name 
   * 
   * @type {string}
   */
  fileName: string;

  setFileName(name: string) {
    this.fileName = name;
  }

  getFileName() : string {
    return this.fileName
  }

  // Check if fileName is right format
  isRightFormat() : boolean {
    var extension = this.getFileExtension(this.fileName);
    return (extension === "xls" || extension === "xlsx");
  }

  /**
   * get file extension
   * 
   * @private
   * @param {string} file 
   * @returns {string} 
   */
  private getFileExtension(file: string) : string {
    var index = file.lastIndexOf(".");
    var extension = file.substring(index + 1);
    return extension;
  }

}
