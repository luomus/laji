import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { UserService } from '../../shared/service/user.service';
import { FormService } from '../../shared/service/form.service';
import { Document } from '../../shared/model/Document';
import { Observable } from 'rxjs/Observable';
import { NamedPlacesService } from '../named-place/named-places.service';

@Component({
  selector: 'laji-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatisticsComponent implements OnInit {

  document: Document;
  ns: any;
  form: any;
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
      this.documentApi.findById(this.route.snapshot.params.documentID, this.userService.getToken())
        .switchMap((document: Document) => Observable.forkJoin(
            this.formService.getForm(document.formID, 'fi'),
            document.namedPlaceID ?
              this.namedPlacesService
                .getNamedPlace(document.namedPlaceID, this.userService.getToken())
                .catch(() => Observable.of({})) :
              Observable.of({}),
            (form, ns) => ({form, ns})
          ),
          (document, formData) => ({form: formData.form, ns: formData.ns, document}))
        .subscribe((data) => {
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

}
