import {Component, OnInit, Input, OnChanges} from '@angular/core';
import {Document, DocumentApi} from "../../shared";

@Component({
  selector: 'laji-haseka-latest',
  templateUrl: 'haseka-users-latest.component.html'
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
