import {Component, OnInit, Input, OnChanges} from '@angular/core';
import {Document, DocumentApi} from "../../shared";
import {ShortDocumentComponent} from "./short-document.component";

@Component({
  moduleId: module.id,
  selector: 'laji-haseka-latest',
  templateUrl: 'haseka-users-latest.component.html',
  directives: [ ShortDocumentComponent ]
})
export class UsersLatestComponent implements OnChanges {

  @Input() userToken:string;

  public documents:Document[];
  public total = 0;
  public page = 1;
  public pageSize = 10;

  constructor(private documentService:DocumentApi) {
  }

  ngOnChanges() {
    this.updateList();
  }

  updateList() {
    if (!this.userToken) {
      return;
    }
    this.documentService.findAll(this.userToken, String(this.page), String(this.pageSize))
      .subscribe(
        result => {
          this.documents = result.results || [];
          this.total = result.total || 0;
        },
        err => console.log(err)
      );
  }

}
