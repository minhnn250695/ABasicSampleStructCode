import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { SetupService } from '../setup.service';
import { SecurityService } from '../../security/security.service';
import { LoaderService } from '../../common/modules/loader';
import { SetupStep3, SocialMediaType } from '../models';

@Component({
    selector: 'app-setup-step3',
    templateUrl: './setup-step3.component.html',
    styleUrls: ['./setup-step3.component.css']
})
export class SetupStep3Component implements OnInit {

    step: SetupStep3;
    @ViewChild("chooseFile") chooseFile: any;

    constructor(private router: Router,
        private service: SetupService,
        private loaderService: LoaderService,
        private securityService: SecurityService) {

        this.step = new SetupStep3();
    }

    ngOnInit() {
        this.securityService.checkAuthenticatedUser().then(result => {
            this.service.getSetupStep3().subscribe(result => {
                this.step.companyId = result.companyId;
                this.step.logoPath = result.logoPath;
                this.step.addressLine1 = result.addressLine1;
                this.step.addressLine2 = result.addressLine2;
                this.step.city = result.city;
                this.step.stateOrProvince = result.stateOrProvince;
                this.step.postalCode = result.postalCode;
                this.step.email = result.email;
                this.step.phone = result.phone;
                if (result.socialMedias.length > 0) {
                    for (var i = 0; i < this.step.socialMedias.length; i++) {
                        var socialMedia = result.socialMedias.find(item => item.socialMediaType == this.step.socialMedias[i].socialMediaType);
                        if (socialMedia) {
                            this.step.socialMedias[i].url = socialMedia.url;
                        }
                    }
                }

            });
        });
    }

    save() {
        this.loaderService.show();
        this.service.saveSetupStep3(this.step).subscribe(result => {
            if (result.success) {
                this.continue();
            }
        });
    }

    continue() {
        this.securityService.clearAuthenticatedUserInfo();
        this.securityService.getTokenForSSOCase().then(result => {
            this.securityService.checkAuthenticatedUser().then(result => {
                localStorage.setItem('companyLogoPath', this.step.logoPath);
                this.router.navigate(["/landing"]);
                this.loaderService.hide();
            });
        });
    }

    getSocialMediaClass(mediaType: SocialMediaType): string[] {

        let classes = ['fab', 'fa-lg'];
        switch (mediaType) {
            case SocialMediaType.Facebook:
                classes.push('fa-facebook');
                break;
            case SocialMediaType.Twitter:
                classes.push('fa-twitter');
                break;
            case SocialMediaType.Youtube:
                classes.push('fa-youtube');
                break;
            case SocialMediaType.Linkedin:
                classes.push('fa-linkedin');
                break;
            default:
        }

        return classes;
    }

    private uploadLogo() {
        this.chooseFile.nativeElement.click()
    }

    private onFileChanged(event) {
        let fileList: FileList = event.target.files;
        if (fileList.length == 1) {
            let file: File = fileList.item(0);
            this.service.uploadLogo(file).subscribe(result => {
                this.step.logoPath = result.data.url;
            });
        }
    }


}
