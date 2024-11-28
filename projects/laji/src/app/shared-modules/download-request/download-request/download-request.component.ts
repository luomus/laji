import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DownloadRequest } from '../models';
import { toHtmlInputElement } from '../../../shared/service/html-element.service';
import { LajiApi, LajiApiService } from '../../../shared/service/laji-api.service';
import { Collection } from '../../../shared/model/Collection';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-download-request',
  templateUrl: './download-request.component.html',
  styleUrls: ['./download-request.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DownloadRequestComponent implements OnChanges {
  @Input() downloadRequest!: DownloadRequest;
  @Input() showPerson = false;
  @Input() showDownload: 'always'|'publicOnly'|'never' = 'never';
  @Input() showTitle = false;

  collections$: Observable<Collection[]>;
  private collectionIds$ = new BehaviorSubject<string[]>([]);

  constructor(
    private lajiApi: LajiApiService,
    private translate: TranslateService
  ) {
    this.collections$ = this.collectionIds$.pipe(
      switchMap(collectionIds => {
        if (collectionIds?.length > 0) {
          return this.lajiApi.getList(LajiApi.Endpoints.collections, {
            idIn: collectionIds.join(','),
            lang: this.translate.currentLang,
            page: 1,
            pageSize: collectionIds.length
          }).pipe(
            map(results => results.results),
            tap(collections => this.sortCollections(collections, collectionIds))
          );
        } else {
          return of([]);
        }
      })
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.downloadRequest) {
      this.collectionIds$.next(
        (this.downloadRequest?.collections || []).map(col => col.id)
      );
    }
  }

  selectInput(event: Event) {
    toHtmlInputElement(event.target).select();
  }

  private sortCollections(collections: Collection[], sortedIds: string[]) {
    const idxById: Record<string, number> = sortedIds.reduce((result, id, idx) => {
      result[id] = idx;
      return result;
    }, {} as any);

    collections.sort((a, b) => idxById[a.id] - idxById[b.id]);
  }
}
