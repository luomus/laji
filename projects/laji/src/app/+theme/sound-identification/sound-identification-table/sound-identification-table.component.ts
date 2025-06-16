import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef, Input } from '@angular/core';
import { IdentificationData } from '../sound-identification-api';
import { Observable } from 'rxjs';
import { LajiApi, LajiApiService } from 'projects/laji/src/app/shared/service/laji-api.service';
import { TranslateService } from '@ngx-translate/core';
import { map, shareReplay, tap } from 'rxjs/operators';

@Component({
  selector: 'laji-sound-identification-table',
  templateUrl: './sound-identification-table.component.html',
  styleUrls: ['./sound-identification-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SoundIdentificationTableComponent implements OnInit {
  @ViewChild('clipSpan', { static: true }) public clipSpanTemplate!: TemplateRef<any>;
  @ViewChild('vernacularName', { static: true }) public vernacularNameTemplate!: TemplateRef<any>;

  @Input() data?: IdentificationData[];
  @Input() loading = false;

  columns!: any[];
  vernacularCache: {
    [key: string]: Observable<{
      'fi'?: string;
      'en'?: string;
      'sv'?: string;
    }>;
  } = {};
  lang!: string;

  constructor(
    private lajiApiService: LajiApiService,
    private translate: TranslateService
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
      this.vernacularCache[scientificName] = this.lajiApiService
        .get(LajiApi.Endpoints.autocomplete, 'taxon',
          {
            q: scientificName,
            lang: 'multi',
            includePayload: true,
            matchType: LajiApi.AutocompleteMatchType.exact
          } as LajiApi.Query.AutocompleteQuery).pipe(
          tap(console.log),
          map(data => data[0]?.payload.vernacularName),
          shareReplay(1)
        );
    }

    return this.vernacularCache[scientificName];
  }

}
