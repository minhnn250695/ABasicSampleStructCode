import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'fp-paging',
  templateUrl: './paging.component.html',
  styleUrls: ['./paging.component.css']
})
export class PagingComponent implements OnInit {

  @Input() id: string;
  @Input() currentPage: number;

  @Output("searchPage") searchPage = new EventEmitter();

  showPages: number[] = [];
  minPage: number = 1;
  totalPages: number = 0;

  constructor() { }

  ngOnInit() { }

  goBack() {
    // redirect to previous page
    if (this.currentPage > this.minPage) {
      this.currentPage--;
      this.getSelectedPage(this.currentPage);
    }
  }

  goNext() {
    // redirect to next page
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getSelectedPage(this.currentPage);
    }
  }

  getSelectedPage(page) {
    this.currentPage = page;
    this.searchPage.emit(page);
  }

  initPages(totalPages) {
    if (totalPages) {
      if (this.currentPage > 6 && totalPages > 10) {
        // current pages is after 5 other pages
        this.minPage = this.currentPage - 5;
      }
      else this.minPage = 1;

      this.totalPages = totalPages;
      this.getShowPages(this.minPage);
    }
  }

  private getShowPages(min: number) {
    let max = 0;
    // if the space (min -> max) isn't enough 10 pages, then reset min and max
    if (this.totalPages <= min + 9) {
      max = this.totalPages;
      // min = this.totalPages - 9;
    } else {
      max = min + 9;
    }
    this.showPages = [];
    for (let i = min; i <= max; i++) {
      this.showPages.push(i);
    }
  }
}
