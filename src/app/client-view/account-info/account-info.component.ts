import { Component, OnInit, ApplicationRef } from '@angular/core';
import { ClientViewService } from '../client-view.service';
import { ConfigService } from '../../common/services/config-service';
import { RefreshService } from '../../common/services/refresh.service';
import { AccountInfoService } from './account-info.service';
import { BaseComponentComponent } from '../../common/components/base-component';
import { RoleAccess } from '../models';
import { Router } from '@angular/router';

declare var $: any;
@Component({
  selector: 'app-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.css']
})

export class AccountInfoComponent extends BaseComponentComponent implements OnInit {

  isUpdateSuccess: boolean = false;
  user: any;

  constructor(private clientViewService: ClientViewService,
    private accountInfoService: AccountInfoService,
    private router: Router,
    configService: ConfigService,
    private refreshService: RefreshService) {
    super(configService);
  }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('authenticatedUser'));
    this.clientViewService.hideLoading();
    this.setupPopover();
  }

  setupPopover() {

    // close popover when click outside
    $('html').on('click', function (e) {
      if (!$(e.target).parents().is('.popover.in') && !$(e.target).parents().is('a')) {
        $('[rel="popover"]').popover('hide');
      }
    });

    let popOver = $('[rel="popover"]');
    popOver.popover({
      container: 'body',
      html: true,
      trigger: 'manual',
      content: function () {
        var clone = $($(this).data('popover-content')).clone(true).removeClass('hide');
        return clone;
      }
    });

    $('#saveEmail').click((e) => {
      let email = $('.popover #txtEmail').val();
      $('#btnEmail').popover('hide');
    });

    $('#savePass').click(() => {
      let oldPass = $('.popover #txtOldPass').val();
      let newPass = $('.popover #txtNewPass').val();
      let rePass = $('.popover #txtRePass').val();

      this.updateNewPass(oldPass, newPass, rePass);

    })
  }

  updateNewPass(oldPass: string, newPass: string, rePass: string) {
    if (oldPass && newPass && rePass && oldPass.trim() != '' && newPass.trim() != '' && rePass.trim() != '' && this.checkPassword(newPass)) {
      if (newPass == rePass) {
        this.clientViewService.showLoading();
        $('#btnPass').popover('hide');
        this.accountInfoService.updatePassword({ userName: this.user.userName, oldPass: oldPass, newPass: rePass }).subscribe(response => {
          this.clientViewService.hideLoading();

          if (response.success) {
            $('#btnPass').attr('data-content', $('#updatePassSuccess').html());
            $('#btnPass').popover('show');
          }
        }, error => {
          this.clientViewService.hideLoading();
          console.log(error)
        });

      }
      console.log("Not valid")
    }
  }

  updateProfileImg(file: File) {
    if (!file) return;
    this.refreshService.setProfileImageOld(this.getProfileImage());

    this.clientViewService.showLoading();
    this.accountInfoService.updateProfilePhoto(file).subscribe(response => {
      if (response) {
        this.clientViewService.hideLoading();
        this.getProfileImage();
        // window.location.reload();
        // this.applicationRef.tick();
        this.refreshService.setRefresh(true);
        this.refreshService.setProfileImage(response.imageUrl);
        // console.log(response);
      }
    })
  }

  getProfileImage() {
    let imgUrl = localStorage.getItem('profileImage');
    return this.getImgUrl(imgUrl);
  }

  private checkPassword(str: string) {
    // at least one number, one lowercase and one uppercase letter, special character and minimum 8 characters
    var re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[\w~@#$%^&*+=`|{}:;!.?\"()\[\]-]{8,}$/;
    return re.test(str);
  }
}
