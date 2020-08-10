import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from '../../../../node_modules/rxjs';
import { Contact } from "../../client-view/models";
// import { DatePickerComponent } from '../../common/components/date-picker/date-picker.component';
import { CropImageComponent } from '../../common/components/crop-image/crop-image.component';
import { DatepickerComponent } from '../../common/components/datepicker/datepicker.component';
import { MaritalStatusCode } from "../../common/models";
import { ConfigService } from '../../common/services/config-service';
import { OptionModel } from "../models/index";
import { OnBoardingCommonComponent } from "../on-boarding-common.component";
import { OnBoardingService } from "../on-boarding.service";
import { ISubscription } from 'rxjs/Subscription';


declare var $: any;
@Component({
  selector: "app-personal-information",
  templateUrl: "./personal-information.component.html",
  styleUrls: ["./personal-information.component.css"],
})
export class PersonalInformationComponent extends OnBoardingCommonComponent implements OnInit {

  @ViewChild("datePicker") datePicker: DatepickerComponent;
  @ViewChild("cropImage") cropImage: CropImageComponent;

  onLoadComponent: boolean = true; // component first load.
  userInfo: Contact = new Contact();
  profileImg: string = "../../../assets/img/default-profile.png";
  profileImage: File;
  isImageChanged: boolean = false;
  selectedStatus: number;
  selectedGender: number;
  maritalStatuses: Array<OptionModel<MaritalStatusCode>> = [];
  genderTypes: Array<OptionModel<number>> = [];
  private iSub: ISubscription;
  constructor(private onboardingService: OnBoardingService, private router: Router, configService: ConfigService) {
    super(configService);
    this.datePicker = new DatepickerComponent();
  }

  ngOnInit(): void {
    this.myLoadingSpinner.closeImmediate();

    super.scrollTop();
    super.initTooltip();
    this.checkUsingMobile();

    // update current step
    this.onboardingService.updateCurrentStep(2);

    // load compulsory component
    this.getMaritalStatus();
    this.getGender();
    this.getHouseHoldInfo();
    this.onboardingService.setUpdateEnd("");
  }

  /**
   * ========================================================================================================
   *                                          GET ESSENTIAL DATA
   * ========================================================================================================
   */
  getMaritalStatus() {
    this.maritalStatuses = super.getMaritalStatusList();
    this.selectedStatus = this.maritalStatuses[0].code;
  }

  getGender() {
    this.genderTypes = super.getGenderList();
    this.selectedGender = this.genderTypes[0].code;
  }

  getHouseHoldInfo() {
    this.onboardingService.getHouseHold().subscribe((response) => {
      // handle loading
      if (this.onLoadComponent) {
        this.onLoadComponent = false;
      }
      else
        super.showLoading(false);
      // handle response
      if (response) {
        let user = response && response.members[0];
        this.userInfo = user;
        // this.profileImage = user.profileImage;

        this.selectedStatus = user.maritalStatus;
        this.selectedGender = user.gender;
        this.createProfileUrl(this.userInfo.profileImageUrl);

        // store household
        this.onboardingService.storeHouseHold(response);
      }
    });
  }
  /**
   * ======================================   END SECTION  ===================================================
   */



  /**
   * ========================================================================================================
   *                                          IMAGE HANDLER
   * ========================================================================================================
   */

  initProfileImg(img?: string): any {
    if (!img) { return "../../../assets/img/add-member.png"; }
    return this.baseApiUrl + img;
  }

  createProfileUrl(imgUrl: string): void {
    if (!this.baseApiUrl || !imgUrl || imgUrl === "undefined") {
      return;
    } else {
      this.profileImg = this.baseApiUrl + imgUrl;
      // if (this.onboardingService.primaryClientId == this.userInfo.id) {
      //   localStorage.setItem("profileImage", imgUrl);
      // }
    }
  }

  handleUploadImage(input) {
    if (input.target.files && input.target.files[0]) {
      this.cropImage.showCropTool(input.target.files[0]);
    }
  }

  handleCroppedImage(base64: any) {
    $("#profileImage").attr('src', base64);
    this.isImageChanged = true;
    this.profileImage = this.convertBase64ToFile(base64, this.createRandomString());
    // this.updateProfile(imageFile);
  }

  /**
   * ======================================   END SECTION  ===================================================
   */


  /**
   * ========================================================================================================
   *                                          ACTION EVENTS
   * ========================================================================================================
   */
  onUpdateMaritialStatus(status: any): void {
    this.userInfo.maritalStatus = status.target.value;
  }

  onUpdateGender(gender: any): void {
    this.userInfo.gender = gender.target.value;
  }

  private navigateToStep(url: string) {
    this.router.navigate([url]);
  }

  btnSaveClick(): void {
    let submitForm: Contact = this.generateSubmitForm();
    let observables: Array<Observable<any>> = [];

    super.showLoading(true);
    // this.onboardingService.setUpdateBegin(true);

    if (this.isImageChanged) // just update image if user choose new one
      observables.push(this.onboardingService.updateProfileImg(submitForm.id, this.profileImage));

    observables.push(this.onboardingService.updatePersonalInformation(submitForm));

    if (observables.length > 0) {
      this.iSub = Observable.zip.apply(null, observables).subscribe((response) => {
        if (this.iSub) {
          this.iSub.unsubscribe();
        }
        this.onboardingService.setUpdateEnd("ended");
        if (this.isMobile)
          this.router.navigate(["mobile-on-boarding/family-member"]);
        else
          this.router.navigate(["on-boarding/family-member"]);
      });
    }
    // this.onboardingService.updatePersonalInformation(submitForm).subscribe(response => {
    //   super.showLoading(false);
    // //   this.onboardingService.setUpdateSignal(true);
    //   if (this.isMobile)
    //     this.router.navigate(["mobile-on-boarding/family-member"]);
    //   else
    //     this.router.navigate(["on-boarding/family-member"]);
    // });
  }

  private generateSubmitForm(): Contact {
    // get selected birthday
    let form: Contact = { ...this.userInfo };
    form.birthday = this.datePicker.getSelectingDate();
    return form;
  }

  //   private updateProfile(imageFile: File) {
  //     super.showLoading(true);
  //     // Call api to upload image to server
  //     this.onboardingService.updateProfileImg(this.userInfo.id, imageFile).subscribe(response => {
  //       super.showLoading(false);
  //       if (response) {
  //         this.createProfileUrl(response);
  //       }
  //     });
  //   }
  /**
   * ======================================   END SECTION  ===================================================
   */
}