import { Component, OnInit } from '@angular/core';
import { DataFeedsBaseComponent } from './data-feeds-base-components.component';
import { DataFeedsStorage } from './data-feeds-storage.service';
import { DataFeedsService } from './data-feeds.service';

@Component({
  selector: 'app-data-feeds',
  templateUrl: './data-feeds.component.html',
  styleUrls: ['./data-feeds.component.css']
})
export class DataFeedsComponent extends DataFeedsBaseComponent implements OnInit {
  constructor(private dataFeedsService: DataFeedsService,
    private dataFeedsStorage: DataFeedsStorage) {
    super();
  }

  ngOnInit() {

    this.dataFeedsStorage.checkAllSources();
  }
}
