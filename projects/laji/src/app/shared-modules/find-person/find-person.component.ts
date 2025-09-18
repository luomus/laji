import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { Person } from '../../shared/model/Person';
import { map, mergeMap } from 'rxjs/operators';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';

@Component({
  selector: 'laji-find-person',
  templateUrl: './find-person.component.html',
  styleUrls: ['./find-person.component.css']
})
export class FindPersonComponent implements OnInit {

  @Input() limit = 10;
  @Input() showUserID = false;
  @Input() inputId = '';
  @Output() selectChange = new EventEmitter<Person>();

  dataSource!: Observable<any>;
  typeaheadLoading = false;
  value = '';

  constructor(
    private api: LajiApiClientBService
  ) { }

  ngOnInit() {
    this.dataSource = Observable.create((observer: any) => {
      observer.next(this.value);
    }).pipe(
      mergeMap((token: string) => this.getPerson(token))
    );
  }

  public getPerson(token: string): Observable<any> {
    return this.api.get('/autocomplete/persons', { query: { query: token, limit: this.limit } })
    .pipe(map(({ results }) => results));
  }

  personSelected(event: any) {
    this.value = '';
    this.selectChange.emit({
      id: event.item.key || '',
      fullName: event.item.value || ''
    });
  }

  changeTypeaheadLoading(loading: any) {
    this.typeaheadLoading = loading;
  }

}
