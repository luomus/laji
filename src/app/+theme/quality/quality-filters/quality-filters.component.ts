import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-quality-filters',
  templateUrl: './quality-filters.component.html',
  styleUrls: ['./quality-filters.component.css']
})
export class QualityFiltersComponent implements OnInit {
  @Output() onSelect = new EventEmitter();

  filters = {
    group: '',
    timeStart: '',
    timeEnd: ''
  };

  constructor(
    public translateService: TranslateService
  ) {}

  ngOnInit() {
  }

  onSelectChange() {
    this.onSelect.emit(this.filters);
  }
}
