import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'fp-footer-min',
    templateUrl: './footer-min.component.html',
    styleUrls: ['./footer-min.component.css']
})
export class FooterMinComponent implements OnInit {
    @Input('customClass') customClass: string;
    isMobile: boolean;

    ngOnInit() {
        if (navigator.userAgent.includes("Mobile"))
            this.isMobile = true;
        else
            this.isMobile = false;
    }
}
