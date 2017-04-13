import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Document } from '../../shared/model/Document';
import { FormService } from '../../shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { WindowRef } from '../../shared/windows-ref';

@Component({
  selector: 'laji-short-document',
  templateUrl: './short-document.component.html',
  styleUrls: ['./short-document.component.css']
})
export class ShortDocumentComponent implements OnInit, OnChanges {
  @Input() document: Document;
  @Input() showList = false;

  public taxa: Array<{ name: string, id: string }>;
  public gatheringDates: { start: string, end: string };
  public publicity = Document.PublicityRestrictionsEnum;

  constructor(
    public formService: FormService,
    private router: Router,
    private translate: TranslateService,
    private winRef: WindowRef
  ) {}

  ngOnInit() {
    console.log(this.document);
    this.updateTaxa();
    this.updateGatheredDates();
  }

  ngOnChanges() {
    this.updateTaxa();
    this.updateGatheredDates();
  }

  updateTaxa(max = 10) {
    const result = [];
    if (!this.document.gatherings || !Array.isArray(this.document.gatherings)) {
      return result;
    }
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
            }, taxon );
        }
        result.push({
          name: taxon,
          id: unit.id
        });
      });
    });
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
