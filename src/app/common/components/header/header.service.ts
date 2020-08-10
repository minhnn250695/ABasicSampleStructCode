import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class HeaderService {
  /** Update Company logo only */
  updateCompanyLogoRequest: BehaviorSubject<boolean> = new BehaviorSubject(false);
  /** Update User profile image only */
  updateUserProfileImageRequest: BehaviorSubject<boolean> = new BehaviorSubject(false);
  /** Update both Company logo and User profile */
  updateHeaderRequest: BehaviorSubject<boolean> = new BehaviorSubject(false);
  /** Handle header loading */
  showHeaderLoadingRequest: BehaviorSubject<boolean> = new BehaviorSubject(false);
}
