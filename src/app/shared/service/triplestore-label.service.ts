import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MetadataApi } from '../api/MetadataApi';
import { Logger } from '../logger/logger.service';
import { MetadataService } from './metadata.service';

@Injectable()
export class TriplestoreLabelService {

  private labels;
  private currentLang;
  private pending: Observable<any>;

  constructor(private metadataApi: MetadataApi,
              private metadataService: MetadataService,
              private translate: TranslateService,
              private logger: Logger
  ) {
    this.translate.onLangChange.subscribe(() => {
        this.labels = null;
        this.getLang(this.translate.currentLang);
      }
    );
    if (this.translate.currentLang) {
      this.labels = null;
      this.getLang(this.translate.currentLang);
    }
  };

  public get(key): Observable<string> {
    if (this.labels) {
      return Observable.of(this.labels[key]);
    } else if (this.pending) {
      return Observable.create((observer: Observer<string>) => {
        const onComplete = (res: string) => {
          observer.next(res);
          observer.complete();
        };
        this.pending.subscribe(
          () => {
            onComplete(this.labels[key]);
          },
          err => this.logger.warn('Failed to fetch label for ' + key, err)
        );
      });
    } else {
      return Observable.of(key);
    }
  }

  private getLang(lang) {
    this.pending = Observable.forkJoin(
      this.metadataService.getAllRangesAsLookUp(lang),
      this.metadataApi.metadataAllProperties(lang),
      this.metadataApi.metadataAllClasses(lang)
    )
      .map(data => this.parseResult(data))
      .share();
    this.currentLang = lang;
  }

  private parseResult(result) {
    this.labels = result[0];
    result[1].results.map(property => {
      this.labels[property['shortName']] = property.label || '';
      this.labels[property['property']] = property.label || '';
    });
    result[2].results.map(data => {
      this.labels[data['class']] = data['label'];
    });
  }
}
