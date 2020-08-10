import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class YourGoalService {

  constructor(private httpClient: HttpClient) {
  }

  addClientGoalList(householdId: string, myGoals: any): Observable<any> {
    if (!householdId) { return; }
    let apiUrl = `api/households/${householdId}/Goals`;
    return this.httpClient.post(apiUrl, myGoals);
  }

  getGoalByHouseHoldId(householdId: string): Observable<any> {
    if (!householdId) { return; }
    let apiUrl = `api/households/${householdId}/Goals`;
    return this.httpClient.get(apiUrl);
  }
}
