import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { HouseHoldResponse } from '../client-view/models';

@Injectable()
export class LandingService {

    constructor(private httpClient: HttpClient) { }

    getHouseHold(clientId: string): Observable<HouseHoldResponse> {
        if (!clientId) { return; }
        return this.httpClient.get<HouseHoldResponse>("api/Households/" + clientId);
    }
}
