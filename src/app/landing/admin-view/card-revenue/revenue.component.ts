import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FileImportService } from '../../../file-import/file-import.service';
// Service
import { RevenueImportService } from './../../../revenue-import/revenue-import.service';
import { BaseComponentComponent } from '../../../common/components/base-component';
import { EntityImportExecution } from '../../../file-import/models';

declare var $: any;
@Component({
  selector: 'card-revenue',
  templateUrl: './revenue.component.html',
  styleUrls: ['./revenue.component.css']
})
export class RevenueComponent extends BaseComponentComponent implements OnInit {

  @ViewChild("chooseFile") chooseFile: any;

  isMobile: boolean;

  constructor(private router: Router,
    private crmService: RevenueImportService,
    private fileImportService: FileImportService) {
    super();
  }

  totalDataMigrationRecords: EntityImportExecution[] = [];

  ngOnInit() {
    if (navigator.userAgent.includes("Mobile")) {
      this.isMobile = true;
      $('body').css('padding-top', '0');
    }
    else this.isMobile = false;
    // get import process status list
    this.showLoading(true);
    this.fileImportService.getDataFeedsEntityExecution("").subscribe(res => {
      this.showLoading(false);
      if (res) {
        this.totalDataMigrationRecords = res.filter(record => record.processType == "datamigration");
        this.totalDataMigrationRecords = this.totalDataMigrationRecords.map(record => {
          return this.summarizeDataMigrationStatus(record);
        })
      }
    });

  }
  //#region summary Action

  /**count record by status 
   */
  getSummaryOfRecords() {
    let summary: { quantity: number; description: string }[] = [];
    let numOfInProgress = this.totalDataMigrationRecords.filter(record => record.showingStatus == "In progress");
    let numOfAttention = this.totalDataMigrationRecords.filter(record => record.showingStatus == "Need your attention");
    let numOfCompleted = this.totalDataMigrationRecords.filter(record => record.showingStatus == "Completed");
    let numOfFailed = this.totalDataMigrationRecords.filter(record => record.showingStatus == "Failed");

    summary.push({ quantity: numOfInProgress.length, description: " records are in progress" });
    summary.push({ quantity: numOfAttention.length, description: " records need your attention" });
    summary.push({ quantity: numOfCompleted.length, description: " records completed" });
    summary.push({ quantity: numOfFailed.length, description: " records could not be imported" });

    return summary;
  }

  /**summarize the last status of three (newEntityStatus & updateEntityStatus & processDataStatus)
  */
  summarizeDataMigrationStatus(record: EntityImportExecution): EntityImportExecution {
    // If any status (of newEntityStatus or updateEntityStatus or processDataStatus) 
    //is inprogress then status is inprogress 
    if (record.processDataStatus.status == "InProgress" || record.importUpdatedEntitiesStatus.status == "InProgress"
      || record.importNewEntitesStatus.status == "InProgress") {
      record.showingStatus = "In progress";
    }// any status of three progress is error then showing Failed
    else if (record.processDataStatus.status == "Error" || record.importUpdatedEntitiesStatus.status == "Error"
      || record.importNewEntitesStatus.status == "Error") {
      record.showingStatus = "Failed";
    } else if (record.processDataStatus.status == "Success")
      record.showingStatus = "Need your attention";
    else if (record.importUpdatedEntitiesStatus.status == "Success" || record.importNewEntitesStatus.status == "Success")
      record.showingStatus = "Completed";
    return record;
  }

  btnViewDetail() {
    this.router.navigate(['/import-process-status']);
  }
  //#endregion summary Action

  private background = "#f6f6f6";
  // if whole container is clicked, we open the select file popup
  onDropViewClick() {
    this.router.navigate(['/revenue']);
  }

  onFromFileClick() {
    this.router.navigate(['/file-import']);
  }

  onExternalSoftwareClick(){
    this.router.navigate(['/landing/external-software']);
  }

  onFileSelected(event: File) {
    this.crmService.file = event;
    this.router.navigate(['/revenue']);

  }

  // local variable
  fileName: string = "";
  isFileCorrectFormat: boolean = true;

}
