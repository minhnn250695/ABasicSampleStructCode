import { Directive, ElementRef, Input, HostListener, OnChanges, SimpleChanges } from "@angular/core";
import { ExportFileService } from '../services/export-file-service';

@Directive({
    selector: '[exportData]'
})
export class ExportExcelDirective implements OnChanges {
    constructor(private exportFileService: ExportFileService) {
    }
    @Input('exportData') exportData: any[];
    @Input() fileName: string;

    ngOnChanges(changes: SimpleChanges) {
    }

    @HostListener('click', ['$event']) onClick($event) {
        this.exportFileService.exportExcel(this.exportData, this.fileName);
      }
  
}