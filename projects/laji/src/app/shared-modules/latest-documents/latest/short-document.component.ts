import { delay, tap } from 'rxjs/operators';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { Document } from '../../../shared/model/Document';
import { FormService } from '../../../shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { DocumentInfoService } from '../../../shared/service/document-info.service';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { Form } from '../../../shared/model/Form';

@Component({
  selector: 'laji-short-document',
  templateUrl: './short-document.component.html',
  styleUrls: ['./short-document.component.scss']
})
export class ShortDocumentComponent implements OnInit, OnChanges, OnDestroy {
  @Input() document!: Document & { id: string };
  @Input() form!: Form.List;
  @Input() showFormName = true;
  @Input() staticWidth?: number = undefined;
  @Input() complainLocality? = true;
  @Input() unsaved = false;
  @Output() discardTempDocument = new EventEmitter();
  @Output() showViewer = new EventEmitter<Document>();

  public editDocumentRoute!: string[];
  public unitList: string[] = [];
  public newUnitsLength!: number;
  public gatheringDates!: { start: string | null; end: string | null };
  public publicity = Document.PublicityRestrictionsEnum;
  public locality!: string;

  public showList = false;
  public changingLocale = true;
  public loading = false;

  private subTrans!: Subscription;

  constructor(
    public formService: FormService,
    private translate: TranslateService,
    private localizeRouterService: LocalizeRouterService,
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
    this.editDocumentRoute = this.getEditDocumentRoute(this.document.formID, this.document.id);
    this.locality = DocumentInfoService.getLocality(gatheringInfo);

    this.loading = false;
  }

  getEditDocumentRoute(formId: string, documentId: string) {
    return this.localizeRouterService.translateRoute([this.formService.getEditUrlPath(formId, documentId)]);
  }

  onShowViewer(event: any) {
    event.stopPropagation();
    this.showViewer.emit(this.document);
  }

  showUnitList(event: any) {
    event.stopPropagation();
    this.showList = !this.showList;
  }
}
