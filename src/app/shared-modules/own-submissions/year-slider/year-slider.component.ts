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

  sliderRange: number;
  sliderConfig: any;
  sliderWidth: string;

  oneStepWidth = 100;

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

    this.initSlider();
  }

  sliderRangeChange(newRange) {
    if (this.sliderRange === newRange) { return; }

    this.sliderRange = newRange;
    this.onRangeChange.emit(newRange);
  }

  private initSlider() {
    if (this.yearInfo.length < 2) { return; }

    const stepCount = this.yearInfo.length - 1;
    const percentage = 100 / stepCount;
    const range = {};


    for (let i = 0; i < this.yearInfo.length; i++) {
      this.yearInfo[i].year = parseInt(this.yearInfo[i].year, 10);
      this.countByYear[this.yearInfo[i].year] = this.yearInfo[i].count;

      let key = '';

      if (i === 0) {
        key = 'min';
      } else if (i === this.yearInfo.length - 1) {
        key = 'max';
      } else {
        key = percentage * i + '%';
      }

      range[key] = this.yearInfo[i].year;
    }

    this.sliderWidth = stepCount * this.oneStepWidth + 'px';
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
