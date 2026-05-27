import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';

@Component({
    selector: 'laji-find-person',
    templateUrl: './find-person.component.html',
    styleUrls: ['./find-person.component.css'],
    standalone: false
})
export class FindPersonComponent implements OnInit {

  @Input() limit = 10;
  @Input() showUserID = false;
  @Input() inputId = '';
  @Output() selectChange = new EventEmitter<{ id: string; fullName: string }>();

  dataSource!: Observable<any>;
  typeaheadLoading = false;
  value = '';

  constructor(
    private api: LajiApiClientService
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
