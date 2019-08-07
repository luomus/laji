import { Component, Input, OnInit, ChangeDetectorRef, Output, EventEmitter, OnChanges } from '@angular/core';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { Subscription, Observable, forkJoin, of } from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { map, switchMap } from 'rxjs/operators';
import { Annotation } from '../../shared/model/Annotation';

@Component({
  selector: 'laji-annotations',
  templateUrl: './annotations.component.html',
  styleUrls: ['./annotations.component.scss']
})
export class AnnotationsComponent implements OnInit, OnChanges {

  @Input()
  query: WarehouseQueryInterface;

  @Output() hasData = new EventEmitter<boolean>();

  subAnnotation: Subscription;
  allAnnotations: Annotation[];

  constructor(
    private warehouseApi: WarehouseApi,
    private translations: TranslateService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.updateAnnotations();
  }


  updateAnnotations() {

    this.allAnnotations = [];

    this.subAnnotation = this.warehouseApi.warehouseQueryAnnotationListGet(
      this.query,
      ['document.documentId'],
      ['gathering.eventDate.begin DESC'],
      10000,
      1,
      true
    ).pipe(
      map(res => res.results),
      switchMap(res => this.setData(res))
    ).subscribe(() => {
      this.hasData.emit(this.allAnnotations.length > 0);
      this.cd.markForCheck();
    });
  }


  setData(result: any[]): Observable<any[]> {
    if (result.length < 1) {
      return of([]);
    }

    result.forEach(r => {
      console.log(r.annotation);
      this.allAnnotations.push(r.annotation);
    });

  }

}
