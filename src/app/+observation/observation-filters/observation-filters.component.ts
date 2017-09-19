import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { TranslateService } from '@ngx-translate/core';
import { IdService } from '../../shared/service/id.service';

@Component({
  selector: 'laji-observation-filters',
  templateUrl: './observation-filters.component.html',
  styleUrls: ['./observation-filters.component.css']
})
export class ObservationFiltersComponent implements OnInit {

  @Input() query: WarehouseQueryInterface;
  @Input() visible: boolean;
  @Output() queryChange = new EventEmitter<WarehouseQueryInterface>();

  constructor(
    public translate: TranslateService
  ) { }

  ngOnInit() {
  }

  onRecordBasis(event) {
    if (event.row && event.row.unit && event.row.unit.superRecordBasis) {
      const recordBasis = event.row.unit.superRecordBasis;
      const allBasis = this.query.superRecordBasis || [];
      const idx = allBasis.indexOf(recordBasis);
      if (idx > -1) {
        this.queryChange.emit({...this.query, superRecordBasis: [
          ...allBasis.slice(0, idx),
          ...allBasis.slice(idx + 1)
        ]})
      } else {
        allBasis.push(recordBasis);
        this.queryChange.emit({...this.query, superRecordBasis: allBasis})
      }
    }

  }

  onMediaSelect(event) {
    this.queryChange.emit({...this.query, hasUnitMedia: (this.query.hasUnitMedia ? undefined : true)})
  }

  onCollectionSelect(event) {
    if (event.row && event.row.document && event.row.document.collectionId) {
      const collectionID = IdService.getId(event.row.document.collectionId);
      const collections = this.query.collectionId || [];
      const idx = collections.indexOf(collectionID);
      if (idx > -1) {
        this.queryChange.emit({...this.query, collectionId: [
          ...collections.slice(0, idx),
          ...collections.slice(idx + 1)
        ]})
      } else {
        collections.push(collectionID);
        this.queryChange.emit({...this.query, collectionId: collections})
      }
    }
  }

}
