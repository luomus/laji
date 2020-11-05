import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TeamMemberService } from '../team-member.service';

@Component({
  selector: 'laji-member-id-pill-list',
  templateUrl: './member-id-pill-list.component.html',
  styleUrls: ['./member-id-pill-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  preserveWhitespaces: true
})
export class MemberIdPillListComponent implements OnInit {

  @Output() updateList = new EventEmitter();

  _list;

  constructor(private teamMemberService: TeamMemberService) { }

  ngOnInit() {
  }

  @Input() set list(data) {
    if (typeof data === 'string') {
      this._list = data.split(',');
    } else if (Array.isArray(data)) {
      const items = [];
      data.map(item => items.push(...item.split(',')));
      this._list = items;
    }
  }

  remove(item) {
    this.updateList.emit(this._list.filter(value => value !== item));
  }

  getName(id) {
    return this.teamMemberService.getName(id);
  }

}
