import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'third-party-header',
  templateUrl: './third-party-header.component.html',
  styleUrls: ['./third-party-header.component.css']
})
export class ThirdPartyHeaderComponent implements OnInit {

  @Input() active: number = 1;

  constructor() { }

  ngOnInit() {
  }


  private getClass(position: number): string {
    return this.active == position ? "active-breadcrumb" : "margin-right-5";
  }

  private isActive(position: number): boolean {
    return this.active >= position;
  }
}
