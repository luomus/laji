import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Person } from '../../shared/model';
import { LajiApi, LajiApiService } from '../../shared/service/laji-api.service';

@Component({
  selector: 'laji-find-person',
  templateUrl: './find-person.component.html',
  styleUrls: ['./find-person.component.css']
})
export class FindPersonComponent implements OnInit {

  @Input() limit = 10;
  @Output() select = new EventEmitter<Person>();

  dataSource: Observable<any>;
  typeaheadLoading = false;
  value = '';

  constructor(private lajiApi: LajiApiService) { }

  ngOnInit() {
    this.dataSource = Observable.create((observer: any) => {
      observer.next(this.value);
    }).mergeMap((token: string) => this.getPerson(token));
  }

  public getPerson(token: string): Observable<any> {
    return this.lajiApi.get(LajiApi.Endpoints.autocomplete, 'person', {
        q: token,
        limit: '' + this.limit
      });
  }

  personSelected(event) {
    this.value = '';
    this.select.emit({
      id: event.item.key || '',
      fullName: event.item.value || ''
    })
  }

  changeTypeaheadLoading(loading) {
    this.typeaheadLoading = loading;
  }

}
