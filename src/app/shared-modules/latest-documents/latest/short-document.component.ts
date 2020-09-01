import { delay, switchMap, tap } from 'rxjs/operators';
import { Component, EventEmitter, Inject, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Document } from '../../../shared/model/Document';
import { FormService } from '../../../shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { DocumentInfoService } from '../../../shared/service/document-info.service';

import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { getLocality$ } from '../../own-submissions/own-submissions.component';
import { TriplestoreLabelService } from '../../../shared/service/triplestore-label.service';
import { DialogService } from '../../../shared/service/dialog.service';


@Component({
  selector: 'laji-short-document',
  templateUrl: './short-document.component.html',
  styleUrls: ['./short-document.component.scss']
})
export class ShortDocumentComponent implements OnInit, OnChanges, OnDestroy {
  @Input() hasChanges: boolean;
  @Input() document: Document;
  @Input() form: any;
  @Input() showFormName = true;
  @Input() staticWidth: number = undefined;
  @Input() complainLocality = true;
  @Input() unsaved = false;
  @Output() discardTempDocument = new EventEmitter();
  @Output() showViewer = new EventEmitter<Document>();

  public unitList = [];
  public newUnitsLength: number;
  public gatheringDates: {start: string, end: string};
  public publicity = Document.PublicityRestrictionsEnum;
  public locality;
  public dateEdited;
  public namedPlaceID;

  public showList = false;
  public changingLocale = true;
  public loading = false;

  private subTrans: Subscription;

  constructor(
    public formService: FormService,
    private router: Router,
    private translate: TranslateService,
    private labelService: TriplestoreLabelService,
    private localizeRouterService: LocalizeRouterService,
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    this.changingLocale = false;
    this.subTrans = this.translate.onLangChange.pipe(
      tap(() => {
        this.changingLocale = true;
      })).pipe(
      delay(0))
      .subscribe(() => {
        this.changingLocale = false;
      });
    this.updateFields();
  }

  ngOnChanges() {
    this.updateFields();
  }

  ngOnDestroy() {
    this.subTrans.unsubscribe();
  }

  private updateFields() {
    this.loading = true;

    const gatheringInfo = DocumentInfoService.getGatheringInfo(this.document, this.form);
    this.unitList = gatheringInfo.unitList;
    this.newUnitsLength = gatheringInfo.unsavedUnitCount;
    this.gatheringDates = {start: gatheringInfo.dateBegin, end: gatheringInfo.dateEnd};

    this.loading = false;
  }

  getLocality$() {
    const gatheringInfo = DocumentInfoService.getGatheringInfo(this.document, this.form);
    return getLocality$(this.translate, this.labelService, gatheringInfo, this.document);
  }

  editDocument(formId, documentId) {
    this.router.navigate(
      this.localizeRouterService.translateRoute([this.formService.getEditUrlPath(formId, documentId)])
    );
  }

  removeDocument(event) {
    event.stopPropagation();
    if (this.newUnitsLength > 0) {
      this.translate.get('haseka.users.latest.discardConfirm', {unitCount: this.newUnitsLength}).pipe(
        switchMap(msg => this.dialogService.confirm(msg)),
      ).subscribe(
        (confirm) => {
          if (confirm) {
            this.discardTempDocument.emit();
          }
        }
      );
    } else {
      this.discardTempDocument.emit();
    }
  }

  onShowViewer(event) {
    event.stopPropagation();
    this.showViewer.emit(this.document);
  }

  showUnitList(event) {
    event.stopPropagation();
    this.showList = !this.showList;
  }
}
