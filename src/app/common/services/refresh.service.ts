import { Injectable } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class RefreshService {
    private refreshSource = new BehaviorSubject(false);
    refresh = this.refreshSource.asObservable();
    profileImg: string = '';
	profileImgOld: string = '';

    constructor(private localStorage: LocalStorageService) {

    }

    setRefresh(r: boolean){
        this.refreshSource.next(r);
    }

    setProfileImage(r: string){
        this.profileImg = r;
    }

    setProfileImageOld(r: string){
        this.profileImgOld = r;
    }
}