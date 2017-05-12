import { Component, Input, Output, EventEmitter, OnChanges, OnInit, OnDestroy } from '@angular/core';
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
  @Output() onDiscard = new EventEmitter();
  @Output() onShowViewer = new EventEmitter();

  public unitsLength: number;
  public newUnitsLength: number;
  public gatheringDates: { start: string, end: string };
  public publicity = Document.PublicityRestrictionsEnum;
  public locality;
  public dateEdited;

  public hasUnsavedData;

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
    this.updateFields();
  }

  ngOnChanges() {
    this.updateFields();
  }

  ngOnDestroy() {
    this.subTrans.unsubscribe();
  }

  private updateFields() {
    this.newUnitsLength = 0;
    this.unitsLength = 0;
    this.gatheringDates = {start: null, end: null};
    this.locality = null;

    this.formService.hasUnsavedData(this.document.id, this.document)
      .subscribe(
        (value) => { this.hasUnsavedData = value; }
      );

    if (this.document.gatherings && Array.isArray(this.document.gatherings) && this.document.gatherings.length > 0) {
      if (this.document.gatherings[0].locality) {
        this.locality = this.document.gatherings[0].locality;
      }
      this.document.gatherings.map((gathering) => {
        if (gathering.dateBegin && (!this.gatheringDates.start || new Date(gathering.dateBegin) < new Date(this.gatheringDates.start))) {
          this.gatheringDates.start = gathering.dateBegin;
        }

        if (gathering.dateEnd && (!this.gatheringDates.end || new Date(gathering.dateEnd) > new Date(this.gatheringDates.end))) {
          this.gatheringDates.end = gathering.dateEnd;
        }

        if (!gathering.units || !Array.isArray(gathering.units)) {
          return;
        }
        for (let i = 0; i < gathering.units.length; i++) {
          if (!gathering.units[i].id) {
            this.newUnitsLength++;
          }
          this.unitsLength++;
        }
        /*return gathering.units.map((unit) => {
          if (unit.id) {
            let taxon = unit.informalNameString || '';
            if (unit.identifications && Array.isArray(unit.identifications)) {
              taxon = unit.identifications.reduce(
                (acc, cur) => {
                  const curTaxon = cur.taxon || cur.taxonVerbatim;
                  return acc ? acc + ', ' + curTaxon : curTaxon;
                }, taxon);
            }
            result.push(unit.id);
          }
        });*/
      });

      if (this.document['gatheringEvent']) {
        const event = this.document['gatheringEvent'];
        if (event.dateBegin && (!this.gatheringDates.start || new Date(event.dateBegin) < new Date(this.gatheringDates.start))) {
          this.gatheringDates.start = event.dateBegin;
        }
        if (event.dateEnd && (!this.gatheringDates.end || new Date(event.dateEnd) > new Date(this.gatheringDates.end))) {
          this.gatheringDates.end = event.dateEnd;
        }
      }
    }

    this.updateEditDate();
  }

  private updateEditDate() {
    this.formService.getTmpDocumentStoreDate(this.document.id).subscribe(
      (tmpDate) => {
        if (tmpDate && (!this.document.dateEdited || new Date(tmpDate) > new Date(this.document.dateEdited))) {
          this.dateEdited = tmpDate;
        } else if (this.document.dateEdited) {
          this.dateEdited = this.document.dateEdited;
        }
      }
    );
  }

  editDocument(formId, documentId) {
    this.router.navigate([this.formService.getEditUrlPath(formId, documentId)]);
  }

  removeDocument(event, document) {
    event.stopPropagation();

    if (this.newUnitsLength > 0) {
      this.translate.get('haseka.users.latest.discardConfirm', {unitCount: this.newUnitsLength}).subscribe(
        (confirm) => {
          if (this.winRef.nativeWindow.confirm(confirm)) {
            this.onDiscard.emit();
          }
        }
      );
    } else {
      this.onDiscard.emit();
    }
  }

  showViewer(event) {
    event.stopPropagation();
    this.onShowViewer.emit(this.document.id);
  }
}
