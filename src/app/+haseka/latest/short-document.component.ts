import { Component, Input, OnChanges, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Document } from '../../shared/model/Document';
import { FormService } from '../../shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { WindowRef } from '../../shared/windows-ref';
import { Subscription } from 'rxjs/Subscription';

import * as moment from 'moment';
import 'moment/locale/fi';
import 'moment/locale/sv';

@Component({
  selector: 'laji-short-document',
  templateUrl: './short-document.component.html',
  styleUrls: ['./short-document.component.css']
})
export class ShortDocumentComponent implements OnInit, OnChanges, OnDestroy {
  @Input() document: Document;

  public taxa: Array<{ name: string, id: string }>;
  public gatheringDates: { start: string, end: string };
  public publicity = Document.PublicityRestrictionsEnum;

  public changingLocale = true;

  private subTrans: Subscription;

  constructor(
    public formService: FormService,
    private router: Router,
    private translate: TranslateService,
    private winRef: WindowRef
  ) {}

  ngOnInit() {
    moment.locale(this.translate.currentLang);
    this.changingLocale = false;
    this.subTrans = this.translate.onLangChange.subscribe(
      () => {
        this.changingLocale = true;
        moment.locale(this.translate.currentLang);
        const that = this;
        setTimeout(() => {
          that.changingLocale = false;
        }, 0);
      }
    );
    console.log(this.document);
    this.updateTaxa();
    this.updateGatheredDates();
  }

  ngOnChanges() {
    this.updateTaxa();
    this.updateGatheredDates();
  }

  ngOnDestroy() {
    this.subTrans.unsubscribe();
  }

  updateTaxa() {
    const result = [];
    if (this.document.gatherings && Array.isArray(this.document.gatherings)) {
      this.document.gatherings.map((gathering) => {
        if (!gathering.units || !Array.isArray(gathering.units)) {
          return;
        }
        return gathering.units.map((unit) => {
          let taxon = unit.informalNameString || '';
          if (unit.identifications && Array.isArray(unit.identifications)) {
            taxon = unit.identifications.reduce(
              (acc, cur) => {
                const curTaxon = cur.taxon || cur.taxonVerbatim;
                return acc ? acc + ', ' + curTaxon : curTaxon;
              }, taxon);
          }
          result.push({
            name: taxon,
            id: unit.id
          });
        });
      });
    }
    this.taxa = result;
  }

  updateGatheredDates() {
    this.gatheringDates = {start: null, end: null};
    if (!this.document.gatherings) {
      return;
    }
    this.document.gatherings.map((gathering) => {
      if (gathering.dateBegin) {
        this.gatheringDates.start = gathering.dateBegin;
      }
      if (gathering.dateEnd) {
        this.gatheringDates.end = gathering.dateEnd;
      }
    });
  }

  editDocument(formId, documentId) {
    this.router.navigate([this.formService.getEditUrlPath(formId, documentId)]);
  }

  removeDocument(document) {
    this.translate.get('haseka.form.removeConfirm').subscribe(
      (confirm) => {
        if (this.winRef.nativeWindow.confirm(confirm)) {
          this.formService.discard(document.id);
          document.removed = true;
        }
      }
    );
  }
}
