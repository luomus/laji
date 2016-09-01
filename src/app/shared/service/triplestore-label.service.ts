import {Observable, Observer} from "rxjs";

import {Injectable, OnInit} from "@angular/core";
import {MetadataApi} from "../api/MetadataApi";
import {TranslateService} from "ng2-translate";

@Injectable()
export class TriplestoreLabelService {

  private labels;
  private currentLang;
  private pending:Observable<any>;

  constructor(
    private metadataService: MetadataApi,
    private translate: TranslateService
  ) {
    this.translate.onLangChange.subscribe(
      lang => {
        if (this.translate.currentLang) {
          console.log('TRANSLATE');
          this.getLang(this.translate.currentLang);
        }
      }
    );
    this.getLang('fi');
  };

  private getLang(lang) {
    this.pending = Observable.forkJoin(
      this.metadataService.metadataFindAllRanges(lang, true),
      this.metadataService.metadataAllProperties(lang)
    ).share();
    this.currentLang = lang;
  }

  public get(key):Observable<string> {
    if (this.pending) {
      return Observable.create((observer: Observer<string>) => {
        var onComplete = (res: string) => {
          observer.next(res);
          observer.complete();
        };
        this.pending.subscribe(
          (res: any) => {
            this.parseResult(res);
            onComplete(this.labels[key]);
          },
          err => console.log(err)
        );
      });
    } else if (this.labels) {
      return Observable.of(this.labels[key])
    } else {
      return Observable.of(key)
    }
  }

  private parseResult(result) {
    this.labels = result[0];
    result[1].results.map(property => {
      this.labels[property['shortname']] = property.label || '';
      this.labels[property['property']] = property.label || '';
    });
  }
}
