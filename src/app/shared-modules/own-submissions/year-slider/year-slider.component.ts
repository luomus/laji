import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'laji-year-slider',
  templateUrl: './year-slider.component.html',
  styleUrls: ['./year-slider.component.css']
})
export class YearSliderComponent implements OnInit {
  @Input() yearInfo: any[];
  @Input() showCounts = true;
  countByYear = {};
  selectList: {year: number, count: number}[] = [];
  selectValue = 'latest';

  sliderRange: number;
  sliderConfig: any;
  maxSliderWidth: string;
  maxStepWidth = 80;

  pcsString: string;
  pcString: string;
  subTrans: Subscription;

  @Output() onRangeChange = new EventEmitter();

  @ViewChild('sliderRef') sliderRef;

  constructor(
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.updateTranslations();

    this.subTrans = this.translate.onLangChange.subscribe(() => {
      this.updateTranslations();

      if (this.sliderConfig) {
        const p = this.sliderRef.el.nativeElement.querySelector('.noUi-pips');
        p.parentElement.removeChild(p);
        this.sliderRef.slider.pips(this.sliderRef.slider.options.pips);
      }
    });

    this.initSelectList();
    this.initSlider();
  }

  yearSelectChange(val: string) {
    this.selectValue = val;
    if (val === 'latest') {
      this.onRangeChange.emit(this.sliderRange);
    } else {
      this.onRangeChange.emit(parseInt(val, 10));
    }
  }

  sliderRangeChange(newRange: number) {
    if (this.sliderRange === newRange) { return; }

    this.sliderRange = newRange;
    this.onRangeChange.emit(newRange);
  }

  private initSelectList() {
    for (let i = this.yearInfo.length - 11; i >= 0; i--) {
      this.selectList.push(this.yearInfo[i]);
    }
  }

  private initSlider() {
    if (this.yearInfo.length < 2) { return; }

    const startIdx = Math.max(this.yearInfo.length - 10, 0);
    const stepCount = this.yearInfo.length - startIdx - 1;
    const percentage = 100 / stepCount;
    const range = {};

    for (let i = startIdx; i < this.yearInfo.length; i++) {
      const year = this.yearInfo[i].year;
      this.countByYear[year] = this.yearInfo[i].count;

      let key = '';

      if (i === startIdx) {
        key = 'min';
      } else if (i === this.yearInfo.length - 1) {
        key = 'max';
      } else {
        key = percentage * (i - startIdx) + '%';
      }

      range[key] = this.yearInfo[i].year;
    }

    this.maxSliderWidth = stepCount * this.maxStepWidth + 'px';
    this.sliderRange = range['max'];

    this.sliderConfig = {
      connect: true,
      margin: 0,
      snap: true,
      range: range,
      pips: {
        mode: 'range',
        density: 100,
        format: {
          to: (value) => {
            const pcs = this.countByYear[value] === 1 ? this.pcString : this.pcsString;
            return this.showCounts ?
              '<div style="margin: 2px 5px; min-width: 90px">' +
                value + '<br>' + this.countByYear[value] + ' ' + pcs +
              '</div>' :
              '<div style="margin: 2px 5px; min-width: 90px">' + value + '</div>';
          }
        }
      }
    };
  }

  private updateTranslations() {
    this.translate.get('haseka.submissions.pcs.singular').subscribe(
      (msg) => { this.pcString = msg; });

    this.translate.get('haseka.submissions.pcs').subscribe(
      (msg) => { this.pcsString = msg; });
  }
}
