import { Component, OnDestroy, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { Annotation } from '../../../shared/model/Annotation';
import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import * as moment from 'moment';
import 'moment/locale/fi';
import 'moment/locale/sv';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'laji-annotation-list',
  templateUrl: './annotation-list.component.html',
  styleUrls: ['./annotation-list.component.css']
})
export class AnnotationListComponent implements OnInit, OnDestroy {

  @Input() annotations: Annotation[];
  @Input() personID: string;
  @Output() onDelete = new EventEmitter<Annotation>();

  types = Annotation.TypeEnum;
  annotationClass = Annotation.AnnotationClassEnum;
  changingLocale = false;
  langChange: Subscription;

  constructor(private translate: TranslateService) { }

  ngOnInit() {
    moment.locale(this.translate.currentLang);
    this.langChange = this.translate.onLangChange
      .do(() => {
        moment.locale(this.translate.currentLang);
        this.changingLocale = true;
      })
      .delay(0)
      .subscribe(() => this.changingLocale = false );
  }

  ngOnDestroy() {
    if (this.langChange) {
      this.langChange.unsubscribe();
    }
  }

}
