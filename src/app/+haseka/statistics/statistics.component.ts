import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { UserService } from '../../shared/service/user.service';
import { FormService } from '../../shared/service/form.service';
import { Document } from '../../shared/model/Document';

@Component({
  selector: 'laji-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {

  document: Document;
  form: any;
  loaded = false;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private formService: FormService,
    private documentApi: DocumentApi
  ) {
  }

  ngOnInit() {
    if (this.route.snapshot.params.documentID) {
      this.documentApi.findById(this.route.snapshot.params.documentID, this.userService.getToken())
        .switchMap(document => this.formService.getForm(document.formID, 'fi').map((form) => ({form, document})))
        .subscribe((data) => {
          this.document = data.document;
          this.form = data.form;
          this.loaded = true;
        });
    } else {
      this.loaded = true;
    }
  }

}
