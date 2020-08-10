import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { FfRouterService } from './../../../common/services/ff-router.service';

declare var $: any;
@Component({
  selector: 'app-match-completed',
  templateUrl: './match-completed.component.html',
  styleUrls: ['./match-completed.component.css']
})

export class MatchCompletedComponent implements OnInit {

  isMobile: boolean;

  constructor(private router: FfRouterService) { }

  ngOnInit() {
    if (navigator.userAgent.includes("Mobile")) {
      this.isMobile = true;
      $('body').css('padding-top', '0');
    }
    else this.isMobile = false;
  }

  addNewOne() {
    this.router.gotoUploadFilePage();
  }

  viewResults() { }

}
