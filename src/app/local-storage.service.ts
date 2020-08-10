import { Injectable } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';

const BASH_ID = "finpal_bash_indentifier";
const FILE_ID = "finpal_file_indentifier";
const DATA_FEED_BASH_ID = "finpal_data_feed_bash_indentifier";

@Injectable()
export class FpStorageService {

  constructor(private localStorage: LocalStorageService) { }


  saveBashId(bashId: string) {
    localStorage.setItem(BASH_ID, bashId);
  }

  getBashId(): string {
    return localStorage.getItem(BASH_ID);
  }

  removeBashId() {
    return localStorage.removeItem(BASH_ID);
  }

  saveClientId(id: string) {
    localStorage.setItem("selected_client_id_in_client_view", id);
  }

  getClientId(): string {
    return localStorage.getItem("selected_client_id_in_client_view");
  }

  /**
   * Data feeds bash id
   */
  saveDataFeedBashId(bashId: string) {
    localStorage.setItem(DATA_FEED_BASH_ID, bashId);
  }

  getDataFeedBashId(): string {
    return localStorage.getItem(DATA_FEED_BASH_ID);
  }

  /**
   * Data feeds provider
   */

  saveDataFeedsProvider(provider: string, date: string) {
    localStorage.setItem("provider_name", provider);
    localStorage.setItem("data_feeds_access_date", date);
  }

  getDataFeedsProvider(): any {
    let list = {
      Date: localStorage.getItem("data_feeds_access_date"),
      Provider: localStorage.getItem("provider_name")
    };

    return list;
  }

}
