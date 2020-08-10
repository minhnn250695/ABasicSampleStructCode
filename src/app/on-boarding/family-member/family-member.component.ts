import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { ISubscription } from 'rxjs/Subscription';
import { Observable } from '../../../../node_modules/rxjs';
import { Contact, HouseHoldResponse, MaritalStatusCode } from "../../client-view/models";
import { BtnUploadFileComponent } from '../../common/components/btn-upload-file/btn-upload-file.component';
import { CropImageComponent } from '../../common/components/crop-image/crop-image.component';
import { DatepickerComponent } from '../../common/components/datepicker/datepicker.component';
import { ConfirmationDialogService } from '../../common/dialog/confirmation-dialog/confirmation-dialog.service';
// import { DatePickerComponent } from '../../common/components/date-picker/date-picker.component';
import { ErrorDialog } from '../../common/dialog/error-dialog/error-dialog.component';
import { ConfigService } from '../../common/services/config-service';
import { OptionModel } from "../models/index";
import { OnBoardingCommonComponent } from "../on-boarding-common.component";
import { OnBoardingService } from "../on-boarding.service";
import { log } from 'util';

declare var $: any;
@Component({
  selector: "app-family-member",
  templateUrl: "./family-member.component.html",
  styleUrls: ["./family-member.component.css"],
})
export class FamilyMemberComponent extends OnBoardingCommonComponent implements OnInit {
  @ViewChild("datePicker") datePicker: DatepickerComponent = new DatepickerComponent();
  // @ViewChild("myErrorDialog") myErrorDialog: ErrorDialog;
  @ViewChild("btnUpload") btnUpload: BtnUploadFileComponent;
  @ViewChild("cropImage") cropImage: CropImageComponent;

  onLoadComponent: boolean = true;
  isNewMember: boolean = false;
  isBtnContinueClick: boolean = false;
  isShowMissingRequired: boolean = false;
  isPrimaryEmailChecked: boolean = false;
  isPrimaryPhoneChecked: boolean = false;
  showCropperImg: boolean = false;

  memberList: Contact[] = [];
  primaryMember: Contact = new Contact();
  selectedMember: Contact = new Contact();
  nextMember: Contact = new Contact();

  houseHoldId: string;
  primaryClientId: string;
  spouseClientId: string;

  roles: string[] = [];
  maritalStatuses: Array<OptionModel<MaritalStatusCode>> = [];
  genderTypes: Array<OptionModel<number>> = [];

  // view variables
  firstName: string;
  lastName: string;
  gender: number;
  dateOfBirth: string;
  maritalStatus: number;
  role: string;
  email: string;
  homePhone: string;
  mobilePhone: string;
  profileImage: File;

  tempImg: File;
  cropObject: any;
  isSaveOrAddNewClick: boolean = false;
  private confirmDialogSubscription: ISubscription;
  private iSub: ISubscription;
  constructor(
    private onboardingService: OnBoardingService,
    private confirmationDialogService: ConfirmationDialogService,
    private router: Router,
    configService: ConfigService) {
    super(configService);
  }

  ngOnInit() {
    this.myLoadingSpinner.closeImmediate();

    super.scrollTop();
    super.initTooltip();
    this.checkUsingMobile();
    // update current step
    this.onboardingService.updateCurrentStep(3);

    this.initMaritalStatus();
    this.initGender();
    this.initRole();
    this.getMemberList();

    // this.onboardingService.updateBegin.subscribe(message => {
    //     if(message)
    //     {
    //         this.onboardingService.setUpdateBegin(false);
    this.onboardingService.updateEnd.subscribe((message) => {
      if (message === "ended") {

        this.getMemberList();
      }
    });
    //     }
    // });
  }

  ngOnDestroy() {
    this.selectedMember = new Contact();
    this.isPrimaryPhoneChecked = false;
    this.isPrimaryEmailChecked = false;
  }

  /**
   * =================================================================================================================
   * |                                          INITIATE ESSENTIAL DATA                                                      |
   * =================================================================================================================
   */


  initMaritalStatus() {
    this.maritalStatuses = super.getMaritalStatusList();
  }

  initGender() {
    this.genderTypes = super.getGenderList();
  }

  initRole() {
    this.roles = ["Spouse", "Child"];
  }

  initNewMember() {
    this.resetView();

    this.selectedMember = new Contact();
    this.selectedMember.houseHoldId = this.houseHoldId;
    this.isNewMember = true;
  }

  /**
   * get household from api,
   * bind household's data to variables
   * add all member to member list
   *
   * @param houseHold
   */
  private initHouseHoldInfo(houseHold: HouseHoldResponse) {
    if (!houseHold || !houseHold.members) { return; }

    // reset list of members
    if (this.memberList && this.memberList.length > 0) {
      this.memberList = [];
      this.initNewMember();
      this.isPrimaryPhoneChecked = false;
      this.isPrimaryEmailChecked = false;
    }

    // set data for some variables
    this.houseHoldId = houseHold && houseHold.id;
    this.primaryClientId = houseHold && houseHold.primaryClientId;
    this.spouseClientId = houseHold && houseHold.spouseClientId;

    // bind all member in household to member list
    houseHold.members.forEach((m) => {
      this.memberList.push(m);
    });

    // add role for each member in household
    this.addRoleForMembers();

    // set primary client
    // this.primaryMember = this.memberList && this.memberList[0];
    this.primaryMember = this.memberList && this.memberList[0];

    if (!this.isMobile) {
      // show info of primary member
      this.getMemberInfo(this.primaryMember);
    }
  }

  // get profile imgage string
  // return a link to achieve that image
  initProfileImg(img?: string): any {
    if (!img) { return "../../../assets/img/add-member.png"; }
    return this.baseApiUrl + img;
  }
  /**
  * =========================================        END SECTION     ==================================================
  */



  /**
   * =================================================================================================================
   * |                                          IMAGE HANDLE SECTION                                               |
   * =================================================================================================================
   */

  handleUploadImage(input) {
    if (input.target.files && input.target.files[0]) {
      this.cropImage.showCropTool(input.target.files[0]);
    }
  }

  handleCroppedImage(base64: any) {
    $("#profileImage").attr('src', base64);
    this.profileImage = this.convertBase64ToFile(base64, this.createRandomString());
  }

  updateProfilePicture(id: string, file: File) {
    this.onboardingService.updateProfileImg(id, file).subscribe((response) => {
      if (response) {

        this.profileImage = undefined;
        this.getMemberList();
      }
    });
  }
  /**
   * =========================================        END SECTION     ==================================================
   */



  /**
  * =================================================================================================================
  * |                                         BUTTONS EVENTS                                                |
  * =================================================================================================================
  */


  // get member information from input fields
  // check if there are any missing required fields
  // call api to update
  btnSaveClick() {
    if (this.isMobile) {
      $('#new-family-member').modal("hide");
    }
    let observables: Array<Observable<any>> = [];
    let isImageChanged = this.changeImageDetection();
    let isDataChanged = this.changeInformationDetection();
    this.isSaveOrAddNewClick = true;
    // update image
    if (isImageChanged)
      observables.push(this.onboardingService.updateProfileImg(this.selectedMember.id, this.profileImage));
    // update member's info
    if (isDataChanged) {
      this.updateDataFromView();
      observables.push(this.onboardingService.updatePersonalInformation(this.selectedMember));
    }
    // call update api
    // if(!this.validateBirthDate(this.datePicker.getSelectingDate())){
    //   let iSub: ISubscription = this.confirmationDialogService.showModal({
    //     title: "Format Error",
    //     message: "Birthdays cannot be later than today",
    //     btnOkText: "Ok"
    //   }).subscribe(()=>{iSub.unsubscribe()});
    // }    
    // else 
    if (observables.length > 0) {
      super.showLoading(true);
      this.iSub = Observable.zip.apply(null, observables).subscribe((response) => {
        if (this.iSub) {
          this.iSub.unsubscribe();
        }
        super.showLoading(false);
        let index = 0;
        // update image change
        if (isImageChanged) {
          this.selectedMember.profileImageUrl = response[index];
          this.profileImage = undefined;
          index++;
        }
        // update information changed
        if (isDataChanged) {
          if (response[index].error && response[index].error.errorCode !== 0) {
            // show error message
            this.confirmDialogSubscription = this.confirmationDialogService.showModal({
              title: "Error #" + response[index].error.errorCode,
              message: response[index].error.errorMessage,
              btnOkText: "OK",
            }).subscribe(() => {
              // this.showLoading(true);
              // this.getMemberList();
              this.confirmDialogSubscription.unsubscribe();
            });
          } else {
            this.getMemberList();
          }
        }

        // update header
        let loginUserId = JSON.parse(localStorage.getItem('authenticatedUser')).id;
        if (this.selectedMember.id === loginUserId) {

          this.onboardingService.sendUpdateHeaderRequest();
        }
      });
    }
  }

  /**
   * add new member
   * loading will be closed in getMemberList()
   */
  btnAddClick() {
    this.isSaveOrAddNewClick = true;
    super.showLoading(true);
    this.updateDataFromView();
    if (this.isMobile) {
      $('#new-family-member').modal("hide");
    }
    this.onboardingService.addNewMember(this.selectedMember).subscribe((response) => {
      // check error
      if (response.error && response.error.errorCode !== 0) {
        this.showLoading(false);
        // show error message
        this.confirmDialogSubscription = this.confirmationDialogService.showModal({
          title: "Error #" + response.error.errorCode,
          message: response.error.errorMessage,
          btnOkText: "OK",
        }).subscribe(() => {
          // this.showLoading(true);
          // this.getMemberList();
          this.confirmDialogSubscription.unsubscribe();
        });
      } else {
        // reset datepicker
        this.datePicker.clearNgModelDate();

        // update image with created member
        if (this.changeImageDetection()) {
          let newMemberId = response.data;
          this.updateProfilePicture(newMemberId, this.profileImage);
        } else
          this.getMemberList();
      }
    });
  }

  /**
   * Check if user is changing info => If yes, show warning.
   * Else, navigate to financial situation page.
   *
   */
  btnContinueClick(): any {
    if (this.changeImageDetection() || this.changeInformationDetection()) {
      this.showChangeDataWarning();
      this.isBtnContinueClick = true;
      return;
    }
    if (this.isMobile)
      this.router.navigate(["mobile-on-boarding/financial-situation"]);
    else
      this.router.navigate(["on-boarding/financial-situation"]);
  }

  /**
   * check if use click yes in data change's warning
   * @param value
   */
  btnConfirmClick(value: boolean) {
    // check continue click when changing info
    if (value && this.isBtnContinueClick) {
      if (this.isMobile)
        this.router.navigate(["mobile-on-boarding/financial-situation"]);
      else
        this.router.navigate(["on-boarding/financial-situation"]);
      return;
    }

    // Open modal on mobile when user doesn't want to remove changes.
    if (!value && this.isMobile) {
      $('#new-family-member').modal("show");
    }

    if (value) {
      // reset variable "isBtnContinueClick" to false
      if (this.isBtnContinueClick) {
        this.isBtnContinueClick = false;
      }

      // bind data
      this.getMemberInfo(this.nextMember);
    }
  }


  /** when user click on "Use primary" button for email and home phone
   * it will change the status of the selected field
   * and check if it is checked => bind data from the primary user to this selected member.
   *
   * @param option
   */
  btnPrimaryClick(option: number): any {

    // option 1: For email
    if (option === 1) {
      this.isPrimaryEmailChecked = !this.isPrimaryEmailChecked;
      if (this.isPrimaryEmailChecked && this.primaryMember && this.primaryMember.email) {
        this.email = this.primaryMember.email;
      } else {
        this.email = this.selectedMember.email;
      }
    }

    // option 2: For home phone
    else {
      this.isPrimaryPhoneChecked = !this.isPrimaryPhoneChecked;
      if (this.isPrimaryPhoneChecked && this.primaryMember && this.primaryMember.homePhone) {
        this.homePhone = this.primaryMember.homePhone;
      } else {
        this.homePhone = this.selectedMember.homePhone;
      }
    }

  }

  private navigateToStep(url: string) {
    this.router.navigate([url]);
  }

  /**
  * Check if selected member's email is identical to primary member's email.
  */
  private handlePrimaryEmailCheckBox() {
    if (this.selectedMember.id === this.primaryMember.id) { return; }

    if (this.primaryMember.email && this.primaryMember.email !== "" && this.selectedMember.email === this.primaryMember.email) {
      this.isPrimaryEmailChecked = true;
    } else
      this.isPrimaryEmailChecked = false;
  }

  /**
   * Check if selected member's homephone is identical to primary member's homephone.
   */
  private handlePrimaryPhoneCheckBox() {
    if (this.selectedMember.id === this.primaryMember.id) { return; }

    if (this.primaryMember.homePhone && this.primaryMember.homePhone !== "" && this.selectedMember.homePhone === this.primaryMember.homePhone) {
      this.isPrimaryPhoneChecked = true;
    } else
      this.isPrimaryPhoneChecked = false;
  }

  /**
   * Check if current member is spouse
   */
  private handleRoleSelectOptions() {
    let roles = ["Spouse", "Child"];
    // if (this.selectedMember.role != "Spouse") {
    //   let members = this.memberList.filter(member => member.id != this.selectedMember.id);
    //   for (var i = 0; i < members.length; i++) {
    //     if (members[i].role === "Spouse") {
    //       roles = ["Child"];
    //       break;
    //     }
    //   }
    // }
    this.roles = roles;
  }

  /**
   * =========================================        END SECTION     ==================================================
   */




  /**
  * =================================================================================================================
  * |                                         FAMILY MEMBERS' DATA                                                |
  * =================================================================================================================
  */

  /**
   * Save selected member to `nextMember` variable.
   * Show warning if member's information changed.
   * @param member
   */
  changeMember(member: Contact) {
    if (this.changeInformationDetection() || this.changeImageDetection()) {
      if (!this.isMobile) this.showChangeDataWarning();
      this.nextMember = member ? member : null;
      // if (!member) {
      //   // this.initNewMember();
      //   this.selectedMember = new Contact();
      // }
      return;
    } else
      this.getMemberInfo(member ? member : null);
  }


  /**
   * if new member, call initNewMember()
   * else bind selected member information to variable selectedMember
   * reset variable isShowMissingRequired when clicked on another member
   *
   * @param member
   */
  getMemberInfo(member?: Contact) {
    if (!member) {
      this.initNewMember();
    } else {
      this.resetView();
      // update selected member
      this.updateSelectingMember(member);

      // check all constraint
      this.isNewMember = false;
      this.isShowMissingRequired = !this.checkAllRequiredCompleted(this.selectedMember);
    }
    this.handlePrimaryEmailCheckBox();
    this.handlePrimaryPhoneCheckBox();
    this.handleRoleSelectOptions();
  }

  // call api HouseHold to achieve a list of members
  getMemberList() {
    // reset house hold to update household info
    // this.onboardingService.resetHouseHold();

    this.onboardingService.getHouseHold().subscribe((response) => {
      if (this.onLoadComponent)
        this.onLoadComponent = false;
      else
        super.showLoading(false);
      // store house hold
      this.onboardingService.storeHouseHold(response);
      this.initHouseHoldInfo(response);
    });
  }


  /**
  * Update selected member from the given contact.
  * Check if gender and marital status == 0 => change them `undefined`.
  * @param member
  */
  private updateSelectingMember(member: Contact) {
    this.selectedMember = member;

    // check if gender == 0 => change to `undefined`
    if (this.selectedMember.gender === 0) {
      this.selectedMember.gender = undefined;
    }

    // check if maritalStatus == 0 => change to `undefined`
    if (this.selectedMember.maritalStatus === 0) {
      this.selectedMember.maritalStatus = undefined;
    }
    this.updateDataToView(this.selectedMember);
  }

  private addRoleForMembers(): any {
    if (!this.memberList || this.memberList.length < 1) { return; }
    this.memberList.forEach((member) => {

      if (member.id === this.spouseClientId) {
        member.role = "Spouse";
      }

      if (member.id !== this.primaryClientId && member.id !== this.spouseClientId) {
        member.role = "Child";
      }
    });
  }

  /**
   * =========================================        END SECTION     ==================================================
   */



  /**
    * =================================================================================================================
    * |                                          VALIDATIONS AND CHANGE DETECTION                                                      |
    * =================================================================================================================
    */


  /**
   * Check if all required fields are empty => show yellow question icon and unable to save.
   *
   * @param member
   */
  checkAllRequiredCompleted(member: Contact): any {
    if (!member.firstName || !member.lastName || !member.email || !member.birthday
      || !member.gender || (!member.maritalStatus && !member.role) || !member.mobilePhone
      || !member.homePhone || !member.profileImageUrl || member.firstName.trim() === "" || member.lastName.trim() === ""
      || member.email.trim() === "") {
      return false;
    } else {
      return true;
    }
  };

  isNotPrimaryClient() {
    return !this.primaryClientId || !this.selectedMember || !this.selectedMember.id || this.selectedMember.id != this.primaryClientId;
  }



  /**
  * Compare all the fields on view and primary member.
  * If those fields matches to each other => return false (No change).
  */
  changeInformationDetection() {
    if (this.selectedMember.firstName !== this.firstName
      || this.selectedMember.lastName !== this.lastName
      || this.selectedMember.role !== this.role
      || this.selectedMember.email !== this.email
      || this.selectedMember.homePhone !== this.homePhone
      || this.selectedMember.mobilePhone !== this.mobilePhone
      || this.selectedMember.gender !== this.gender
      || this.selectedMember.maritalStatus !== this.maritalStatus
      || this.selectedMember.birthday !== this.datePicker.getSelectingDate()
    ) {
      return true;
    }
    return false;
  }

  /**
   * Check variable "tempProfileImage".
   * If it valid => return true (User upload new image).
   */
  changeImageDetection() {
    if (this.profileImage)
      return true;
    return false;
  }

  /**
  * =========================================        END SECTION     ==================================================
  */


  /**
   * =================================================================================================================
   * |                                          VIEW                                                       |
   * =================================================================================================================
   */
  /**
   * Set all fields on view and temporary variables to `undefined`.
   *
   */
  private resetView() {
    this.firstName = undefined;
    this.lastName = undefined;
    this.gender = undefined;
    this.maritalStatus = undefined;
    this.role = undefined;
    this.email = undefined;
    this.homePhone = undefined;
    this.mobilePhone = undefined;

    // related variables
    this.dateOfBirth = undefined;
    this.profileImage = undefined;

    // reset upload profile image
    $('#profileImage').attr('src', this.initProfileImg());
    // this.btnUpload.reset();
  }

  /**
   * Show changes warning.
   */
  private showChangeDataWarning() {
    let subscription: ISubscription = this.confirmationDialogService.showModal({
      title: "Warning",
      message: "Your changed data will be lost. Do you want to continue?",
      btnOkText: "Continue",
      btnCancelText: "Cancel",
    }).subscribe((response) => {
      if (response) {
        this.isPrimaryEmailChecked = false;
        this.isPrimaryPhoneChecked = false;
      }
      this.btnConfirmClick(response);

      subscription.unsubscribe(); // unsubscript chanel after receive response
    });
  }

  /**
   * Update all screen fields based on the given member
   * @param member
   */
  private updateDataToView(member: Contact) {
    this.homePhone = member.homePhone;
    this.email = member.email;
    this.firstName = member.firstName;
    this.lastName = member.lastName;
    this.dateOfBirth = member.birthday;
    this.role = member.role;
    this.mobilePhone = member.mobilePhone;
    this.gender = member.gender;
    this.maritalStatus = member.maritalStatus;

    let imgUrl = this.initProfileImg(member.profileImageUrl);
    $('#profileImage').attr('src', imgUrl);
  }

  /**
   * Get data from all fields on view => update to selected member.
   */
  private updateDataFromView() {
    this.selectedMember.firstName = this.firstName;
    this.selectedMember.lastName = this.lastName;
    this.selectedMember.gender = this.gender;
    this.selectedMember.birthday = this.datePicker.getSelectingDate();
    this.selectedMember.maritalStatus = this.maritalStatus;
    this.selectedMember.role = this.role;
    this.selectedMember.email = this.email;
    this.selectedMember.homePhone = this.homePhone;
    this.selectedMember.mobilePhone = this.mobilePhone;
  }
  /**
  * =========================================        END SECTION     ==================================================
  */
}
