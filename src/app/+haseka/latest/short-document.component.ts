import {Component, OnInit, Input, OnChanges} from '@angular/core';
import {Document} from "../../shared/model/Document";

@Component({
  selector: 'laji-short-document',
  templateUrl: 'short-document.component.html'
})
export class ShortDocumentComponent implements OnInit, OnChanges{
  @Input() document:Document;
  @Input() showList:boolean = false;

  public taxa:Array<{ name:string,id:string }>;
  public gatheringDates:{ start:string,end:string };

  ngOnInit() {
    this.updateTaxa();
    this.updateGatheredDates();
  }

  ngOnChanges() {
    this.updateTaxa();
    this.updateGatheredDates();
  }

  updateTaxa(max:number = 10) {
    let result = [];
    if (!this.document.gatherings) {
      return result;
    }
    this.document.gatherings.map((gathering) => {
      if (!gathering.units) {
        return;
      }
      return gathering.units.map((unit) => {
        result.push({
          name: unit.informalNameString,
          id: unit.id
        });
      });
    });
    this.taxa = result;
  }

  updateGatheredDates() {
    this.gatheringDates = {start: null, end:null};
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
