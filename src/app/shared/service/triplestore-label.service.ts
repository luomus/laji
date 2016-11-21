import { Observable, Observer } from 'rxjs';
import { Injectable } from '@angular/core';
import { TranslateService } from 'ng2-translate';
import { MetadataApi } from '../api/MetadataApi';
import { Logger } from '../logger/logger.service';

@Injectable()
export class TriplestoreLabelService {

  private labels;
  private currentLang;
  private pending: Observable<any>;

  constructor(private metadataService: MetadataApi,
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
      this.metadataService.metadataFindAllRanges(lang, true),
      this.metadataService.metadataAllProperties(lang),
      this.metadataService.metadataAllClasses(lang)
    )
      .map(data => this.parseResult(data))
      .share();
    this.currentLang = lang;
  }

  private parseResult(result) {
    this.labels = result[0];
    result[1].results.map(property => {
      this.labels[property['shortname']] = property.label || '';
      this.labels[property['property']] = property.label || '';
    });
    result[2].results.map(data => {
      this.labels[data['class']] = data['label'];
    });
  }
}
