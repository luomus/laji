import { catchError, map, switchMap } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocumentApi } from '../../../shared/api/DocumentApi';
import { UserService } from '../../../shared/service/user.service';
import { FormService } from '../../../shared/service/form.service';
import { Document } from '../../../shared/model/Document';
import { forkJoin as ObservableForkJoin, of as ObservableOf } from 'rxjs';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { Form } from '../../../shared/model/Form';
import { NamedPlacesService } from '../../../shared/service/named-places.service';

@Component({
  selector: 'laji-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatisticsComponent implements OnInit {

  document: Document;
  ns: any;
  form: Form.List;
  loaded = false;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private formService: FormService,
    private documentApi: DocumentApi,
    private namedPlacesService: NamedPlacesService,
    private cd: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    if (this.route.snapshot.params.documentID) {
      this.documentApi.findById(this.route.snapshot.params.documentID, this.userService.getToken()).pipe(
        switchMap((document: Document) => ObservableForkJoin(
          this.formService.getFormInListFormat(document.formID),
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
