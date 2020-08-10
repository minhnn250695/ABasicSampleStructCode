import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input } from '@angular/core';
import { FooterService } from './footer.service';

declare var $: any;
@Component({
    selector: 'fp-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit, OnDestroy {
    @Input() isShow: boolean = false;
    private isDestroy: boolean = false;
    private currentYear: number = 2017;

    isMobile: boolean;
    needHelpHidden: boolean;

    constructor(private changeDetectorRef: ChangeDetectorRef, private footerService: FooterService) { }

    ngOnInit() {
        if (navigator.userAgent.includes("Mobile"))
            this.isMobile = true;
        else
            this.isMobile = false;

        this.isDestroy = false;
        this.footerService.needHelpSectionEvent.subscribe(isShow => {
            this.needHelpHidden = !isShow;
            this.detectChanges();
        })
        this.currentYear = new Date().getFullYear();
    }

    ngOnDestroy() {
        this.isDestroy = true;
    }

    private btnVisitClick() {
        window.open('https://support.fin365.com.au');
    }

    private detectChanges() {
        if (!this.isDestroy) {
            this.changeDetectorRef.detectChanges();
        }
    }

    private checkBodyContentIsOverflow() {
        let bodyHeight = $('body').height() + 128;
        let screenHeight = $(window).height() - 128;
        
        if (bodyHeight < screenHeight)
            return false;
        else
            return true;
    }
}
