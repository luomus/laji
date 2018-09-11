import { Component, EventEmitter, Inject, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Document } from '../../shared/model/Document';
import { FormService } from '../../shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { DocumentInfoService } from '../../shared/service/document-info.service';

import { LocalizeRouterService } from '../../locale/localize-router.service';
import { WINDOW } from '@ng-toolkit/universal';

@Component({
  selector: 'laji-short-document',
  templateUrl: './short-document.component.html',
  styleUrls: ['./short-document.component.css']
})
export class ShortDocumentComponent implements OnInit, OnChanges, OnDestroy {
  @Input() document: Document;
  @Input() form: any;
  @Output() onDiscard = new EventEmitter();
  @Output() onShowViewer = new EventEmitter<Document>();

  public unitList = [];
  public newUnitsLength: number;
  public gatheringDates: {start: string, end: string};
  public publicity = Document.PublicityRestrictionsEnum;
  public locality;
  public dateEdited;

  public showList = false;
  public changingLocale = true;
  public loading = false;

  private subTrans: Subscription;

  constructor(
    public formService: FormService,
    private router: Router,
    private translate: TranslateService,
    private localizeRouterService: LocalizeRouterService,
    @Inject(WINDOW) private window: Window
  ) {}

  ngOnInit() {
    this.changingLocale = false;
    this.subTrans = this.translate.onLangChange
      .do(() => {
        this.changingLocale = true;
      })
      .delay(0)
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
    this.locality = gatheringInfo.locality;

    this.loading = false;
  }

  editDocument(formId, documentId) {
    this.router.navigate(
      this.localizeRouterService.translateRoute([this.formService.getEditUrlPath(formId, documentId)])
    );
  }

  removeDocument(event) {
    event.stopPropagation();

    if (this.newUnitsLength > 0) {
      this.translate.get('haseka.users.latest.discardConfirm', {unitCount: this.newUnitsLength}).subscribe(
        (confirm) => {
          if (this.window.confirm(confirm)) {
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
    this.onShowViewer.emit(this.document);
  }

  showUnitList(event) {
    event.stopPropagation();
    this.showList = !this.showList;
  }
}
