import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TeamMemberService } from '../team-member.service';

@Component({
  selector: 'laji-member-id-pill-list',
  templateUrl: './member-id-pill-list.component.html',
  styleUrls: ['./member-id-pill-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  preserveWhitespaces: true
})
export class MemberIdPillListComponent {

  @Output() updateList = new EventEmitter();

  _list?: string[];

  constructor(private teamMemberService: TeamMemberService) { }

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
    return this.teamMemberService.getName(id);
  }

}
