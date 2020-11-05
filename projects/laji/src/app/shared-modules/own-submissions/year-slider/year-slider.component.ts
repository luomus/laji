import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-year-slider',
  templateUrl: './year-slider.component.html',
  styleUrls: ['./year-slider.component.css']
})
export class YearSliderComponent implements OnInit {
  @Input() year: string;
  @Input() yearInfo: any[];
  @Input() showCounts = true;

  pcsString: string;
  pcString: string;

  @Output() rangeChange = new EventEmitter<string>();

  constructor(
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.updateTranslations();
  }

  yearSelectChange(val: string) {
    this.rangeChange.emit(val);
  }

  private updateTranslations() {
    this.pcString = this.translate.instant('haseka.submissions.pcs.singular');
    this.pcsString = this.translate.instant('haseka.submissions.pcs');
  }
}
