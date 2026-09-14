import { catchError, map, switchMap } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormService } from '../../../shared/service/form.service';
import { forkJoin as ObservableForkJoin, of as ObservableOf } from 'rxjs';
import { components } from 'projects/laji-api-client/generated/api.d';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';

type FormListing = components['schemas']['FormListing'];
type Document = components['schemas']['store-document'];
type NamedPlace = components['schemas']['store-namedPlace'];

@Component({
    selector: 'laji-statistics',
    templateUrl: './statistics.component.html',
    styleUrls: ['./statistics.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class StatisticsComponent implements OnInit {

  document!: Document;
  ns: any;
  form!: FormListing;
  loaded = false;

  constructor(
    private route: ActivatedRoute,
    private formService: FormService,
    private cd: ChangeDetectorRef,
    private api: LajiApiClientService
  ) {
  }

  ngOnInit() {
    if (this.route.snapshot.params.documentID) {
      this.api.get('/documents/{id}', { path: { id: this.route.snapshot.params.documentID } }).pipe(
        switchMap((document: Document) => ObservableForkJoin(
          this.formService.getFormInListFormat(document.formID!),
          document.namedPlaceID
          ? this.api.get('/named-places/{id}', { path: { id: document.namedPlaceID } }).pipe(
              catchError(() => ObservableOf({}))
            )
          : ObservableOf({})
        ).pipe(
          map(data => ({form: data[0], ns: data[1], document}))
        ))
      ).subscribe((data) => {
        this.document = data.document;
        this.form = data.form;
        this.ns = data.ns;
        this.loaded = true;
        this.cd.markForCheck();
      });
    } else {
      this.loaded = true;
    }
  }

  updateNamedPlace(namedPlace: NamedPlace) {
    this.ns = namedPlace;
  }

}
