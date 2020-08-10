

export class FileUtils {

    // Check if fileName is right format
  isExcelFormat(fileName: string) : boolean {
    var extension = this.getFileExtension(fileName);
    return (extension === "xls" || extension === "xlsx");
   }

   isRightFormat(fileName: string, format: string[]) : boolean{
       var extension = this.getFileExtension(fileName);
       if (!format) return false;
       return format.findIndex((item) => item === extension) != -1;
   }

   isCorrectUrlFormat(url: string) {
       return url.startsWith("http://") || url.startsWith("https://");
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