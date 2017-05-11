import { Component, Input, Output, EventEmitter, OnChanges, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Document } from '../../shared/model/Document';
import { FormService } from '../../shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { WindowRef } from '../../shared/windows-ref';
import { Subscription } from 'rxjs/Subscription';
import { DocumentInfoService } from '../document-info.service'

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
    const gatheringInfo = DocumentInfoService.getGatheringInfo(this.document, true);
    this.newUnitsLength = gatheringInfo.unsavedUnitCount;
    this.unitsLength = gatheringInfo.unitCount;
    this.gatheringDates = {start: gatheringInfo.dateBegin, end: gatheringInfo.dateEnd};
    this.locality = gatheringInfo.locality;

    this.formService.hasUnsavedData(this.document.id, this.document)
      .subscribe(
        (value) => { this.hasUnsavedData = value; }
      );

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
