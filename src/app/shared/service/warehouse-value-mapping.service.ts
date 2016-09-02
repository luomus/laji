import {Observable, Observer} from "rxjs";

import {WarehouseApi} from "../api/WarehouseApi";
import {Injectable } from "@angular/core";

@Injectable()
export class WarehouseValueMappingService {

  private mapping;
  private pending:Observable<any>;

  constructor(private warehouseService: WarehouseApi) {
    this.pending = this.warehouseService.warehouseEnumerationLabels().share();
    this.pending.subscribe(
      res => this.parseResult(res)
    );
  };

  public get(value):Observable<string> {
    if (!this.mapping && this.pending) {
      return Observable.create((observer: Observer<string>) => {
        var onComplete = (res: string) => {
          observer.next(res);
          observer.complete();
        };
        this.pending.subscribe((res: any) => {
          this.parseResult(res);
          onComplete(this.mapping[value]);
        });
      });
    } else {
      return Observable.of(this.mapping[value])
    }
  }

  private parseResult(result) {
    this.mapping = {};
    result.results.map(translation => {
      let key = translation.enumeration || '';
      this.mapping[key] = translation.property || '';
    });
  }
}
