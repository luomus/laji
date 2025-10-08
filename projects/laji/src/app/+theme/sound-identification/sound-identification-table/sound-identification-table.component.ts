import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef, Input } from '@angular/core';
import { IdentificationData } from '../sound-identification-api';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { DatatableColumn } from '../../../shared-modules/datatable/model/datatable-column';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';

@Component({
  selector: 'laji-sound-identification-table',
  templateUrl: './sound-identification-table.component.html',
  styleUrls: ['./sound-identification-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SoundIdentificationTableComponent implements OnInit {
  @ViewChild('clipSpan', { static: true }) clipSpanTemplate!: TemplateRef<any>;
  @ViewChild('vernacularName', { static: true }) vernacularNameTemplate!: TemplateRef<any>;

  @Input() data?: IdentificationData[];
  @Input() loading = false;

  columns!: DatatableColumn[];
  vernacularCache: Record<string, Observable<string>> = {};
  lang!: string;

  constructor(
    private api: LajiApiClientBService
  ) { }

  ngOnInit() {
    this.columns = [
      {
        name: 'confidence',
        label: 'theme.soundIdentification.table.confidence',
        width: 50
      },
      {
        name: 'start_time',
        label: 'theme.soundIdentification.table.timeSpan',
        cellTemplate: this.clipSpanTemplate,
        width: 50
      },
      {
        name: 'scientific_name',
        label: 'theme.soundIdentification.table.scientificName',
        width: 100,
      },
      {
        name: 'common_name',
        label: 'theme.soundIdentification.table.vernacularName',
        cellTemplate: this.vernacularNameTemplate,
        width: 100
      }
    ];
  }

  getVernacularName(scientificName: string) {
    if (!this.vernacularCache[scientificName]) {
      this.vernacularCache[scientificName] = this.api.get('/autocomplete/taxa', { query: {
            query: scientificName,
            matchType: 'exact',
        selectedFields: 'vernacularName'
      }}).pipe(
          map(data => data.results[0]?.vernacularName),
          shareReplay(1)
        );
    }

    return this.vernacularCache[scientificName];
  }

}
