import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { Document } from '../../shared/model/Document';
import { UserService } from '../../shared/service/user.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'laji-own-submissions',
  templateUrl: './own-submissions.component.html',
  styleUrls: ['./own-submissions.component.css']
})
export class OwnSubmissionsComponent implements OnInit {
  activeDocuments: Document[];
  documentCache = {};
  documents$: Subscription;

  countByYear = {};

  sliderRange: Number;
  sliderConfig: any;
  sliderWidth: String;

  pcsString: String;
  pcString: String;
  subTrans: Subscription;

  @ViewChild('sliderRef') sliderRef;

  constructor(
    private documentService: DocumentApi,
    private userService: UserService,
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

    this.documentService.countByYear(this.userService.getToken()).subscribe(
      (results) => {
        this.initSlider(results.map((res) => {
          res.year = parseInt(res.year, 10);
          return res;
        }));
        this.getDocumentsByYear(this.sliderRange);
      },
      (err) => { }
    );
  }

  sliderRangeChange(newRange) {
    if (this.sliderRange === newRange) { return; }

    this.sliderRange = newRange;
    this.getDocumentsByYear(newRange);
  }

  private initSlider(yearInfo: any) {
    if (yearInfo.length === 0) { return; }

    const first = yearInfo[0].year;
    const last = yearInfo[yearInfo.length - 1].year;
    const range = {'min': first, 'max': last};

    for (let i = 0; i < yearInfo.length; i++) {
      if (i !== 0 && i !== yearInfo.length - 1) {
        const percentage = (yearInfo[i].year - first) / (last - first) * 100;
        range[percentage + '%'] = yearInfo[i].year;
      }

      this.countByYear[yearInfo[i].year] = yearInfo[i].count;
    }

    this.sliderWidth = Math.min(yearInfo.length * 10, 100) + '%';

    this.sliderRange = last;

    if (yearInfo.length > 1) {
      this.sliderConfig = {
        connect: true,
        margin: 0,
        snap: true,
        range: range,
        pips: {
          mode: 'count',
          values: yearInfo.length,
          density: 100,
          stepped: true,
          format: {
            to: (value, type) => {
              const pcs = this.countByYear[value] === 1 ? this.pcString : this.pcsString;
              return '<div style="margin: 2px 5px; min-width: 90px">' + value + '<br>' + this.countByYear[value] + ' ' + pcs + '</div>';
            }
          }
        }
      };
    }
  }

  private getDocumentsByYear(year: Number) {
    if (this.documents$) {
      this.documents$.unsubscribe();
    }

    if (this.documentCache[String(year)]) {
      this.activeDocuments = this.documentCache[String(year)];
      return;
    }

    this.activeDocuments = null;

    if (!year) { return; }

    this.documents$ = this.documentService.findAll(this.userService.getToken(), String(1), String(1000), String(year))
      .subscribe(
        result => {
          if (result.results) {
            this.documentCache[String(year)] = result.results;
            this.activeDocuments = result.results;
          }
        },
        err => { }
      );
  }

  private updateTranslations() {
    this.translate.get('haseka.submissions.pcs.singular').subscribe(
      (msg) => { this.pcString = msg; });

    this.translate.get('haseka.submissions.pcs').subscribe(
      (msg) => { this.pcsString = msg; });
  }
}
