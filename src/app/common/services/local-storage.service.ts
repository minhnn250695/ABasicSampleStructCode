import { Injectable } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';


const BASH_ID = "finpal_bash_indentifier";
const FILE_ID = "finpal_file_indentifier";

@Injectable()
export class FpStorageService {

  constructor(private localStorage: LocalStorageService) { }

  saveBashId(bashId: string) {
    localStorage.setItem(BASH_ID, bashId);
  }

  getBashId(): string {
    return localStorage.getItem(BASH_ID);
  }

  saveClientId(id: string) {
    localStorage.setItem("selected_client_id_in_client_view", id);
  }

  getClientId(): string {
    return localStorage.getItem("selected_client_id_in_client_view");
  }
}
