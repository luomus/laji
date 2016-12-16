import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Document } from '../../shared/model/Document';
import { FormService } from '../form/form.service';

@Component({
  selector: 'laji-short-document',
  templateUrl: 'short-document.component.html',
  styleUrls: ['./short-document.component.css']
})
export class ShortDocumentComponent implements OnInit, OnChanges {
  @Input() document: Document;
  @Input() showList: boolean = false;

  public taxa: Array<{ name: string, id: string }>;
  public gatheringDates: { start: string, end: string };

  constructor(public formService: FormService) {}

  ngOnInit() {
    this.updateTaxa();
    this.updateGatheredDates();
  }

  ngOnChanges() {
    this.updateTaxa();
    this.updateGatheredDates();
  }

  updateTaxa(max = 10) {
    let result = [];
    if (!this.document.gatherings) {
      return result;
    }
    this.document.gatherings.map((gathering) => {
      if (!gathering.units) {
        return;
      }
      return gathering.units.map((unit) => {
        let taxon = unit.informalNameString || '';
        if (unit.identifications) {
          taxon = unit.identifications.reduce(
            (acc, cur) => {
              let curTaxon = cur.taxon || cur.taxonVerbatim;
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


}
