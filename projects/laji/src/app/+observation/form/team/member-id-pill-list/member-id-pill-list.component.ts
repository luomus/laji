import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { map, of } from 'rxjs';

@Component({
    selector: 'laji-member-id-pill-list',
    templateUrl: './member-id-pill-list.component.html',
    styleUrls: ['./member-id-pill-list.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: true,
    standalone: false
})
export class MemberIdPillListComponent {

  @Output() updateList = new EventEmitter();

  _list?: string[];

  constructor(
    private api: LajiApiClientBService
  ) { }

  @Input() set list(data: string|string[]) {
    if (typeof data === 'string') {
      this._list = data.split(',');
    } else if (Array.isArray(data)) {
      const items: string[] = [];
      data.map(item => items.push(...item.split(',')));
      this._list = items;
    }
  }

  remove(item: string) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.updateList.emit(this._list!.filter(value => value !== item));
  }

  getName(id: string) {
    if (!id) {
      return of('');
    }
    return this.api.get('/warehouse/teamMember/{id}', { path: { id } }).pipe(
      map((result: any) => result.name || result.id),
    );
  }

}
