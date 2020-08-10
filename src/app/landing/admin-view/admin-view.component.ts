import { Component, OnInit } from '@angular/core';
import { BaseComponentComponent } from '../../common/components/base-component';
import { Router } from '@angular/router';

declare var $: any;

@Component({
  selector: 'fp-admin-view',
  templateUrl: './admin-view.component.html',
  styleUrls: ['./admin-view.component.css']
})
export class AdminViewComponent extends BaseComponentComponent implements OnInit {
  
  constructor(private router: Router) {
    super();
  }

  ngOnInit() {
    this.showLoading(false);
    super.checkUsingMobile();
  }

  loadingFunction(event: boolean) {
    this.showLoading(event);
  }
}
