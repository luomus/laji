import { catchError, map, switchMap } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../shared/service/user.service';
import { FormService } from '../../../shared/service/form.service';
import { forkJoin as ObservableForkJoin, of as ObservableOf } from 'rxjs';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { NamedPlacesService } from '../../../shared/service/named-places.service';
import { components } from 'projects/laji-api-client-b/generated/api.d';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';

type FormListing = components['schemas']['FormListing'];
type Document = components['schemas']['store-document'];

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
    private userService: UserService,
    private formService: FormService,
    private namedPlacesService: NamedPlacesService,
    private cd: ChangeDetectorRef,
    private api: LajiApiClientBService
  ) {
  }

  ngOnInit() {
    if (this.route.snapshot.params.documentID) {
      this.api.get('/documents/{id}', { path: { id: this.route.snapshot.params.documentID } }).pipe(
        switchMap((document: Document) => ObservableForkJoin(
          this.formService.getFormInListFormat(document.formID!),
          document.namedPlaceID ?
            this.namedPlacesService
              .getNamedPlace(document.namedPlaceID, this.userService.getToken()).pipe(
              catchError(() => ObservableOf({}))) :
            ObservableOf({})
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
