import { ChangeDetectionStrategy, Component, EventEmitter,
Input, OnInit, Output, OnDestroy } from '@angular/core';
import { Observable, of as ObservableOf, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { TeamMemberService } from './team-member.service';
import { BrowserService } from '../../../shared/service/browser.service';

@Component({
  selector: 'laji-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamComponent implements OnInit, OnDestroy {

  value: string;
  typeaheadLoading: boolean;
  screenWidthSub: Subscription;
  containerTypeAhead: string;
  dataSource: Observable<any>;

  _members: string[] = [];
  _memberIds: string[] = [];

  @Output() update = new EventEmitter<void>();
  @Output() membersChange = new EventEmitter<string[]>();
  @Output() memberIdsChange = new EventEmitter<string[]>();

  constructor(
    private teamMemberService: TeamMemberService,
    private browserService: BrowserService
  ) {
    this.dataSource = Observable.create((observer: any) => {
      observer.next(this.value);
    }).pipe(
      distinctUntilChanged(),
      switchMap((token: string) => this.teamMemberService.getMembers(token)),
      switchMap((data) => {
        if (this.value) {
          return ObservableOf(data);
        }
        return ObservableOf([]);
      })
    );
  }

  ngOnInit() {
    this.screenWidthSub = this.browserService.lgScreen$.subscribe(data => {
      if (data === true) {
        this.containerTypeAhead = 'body';
      } else {
        this.containerTypeAhead = 'laji-observation-form';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.screenWidthSub) {
      this.screenWidthSub.unsubscribe();
    }
  }

  @Input()
  set members(members: string[]) {
    this._members = members || [];
  }

  @Input()
  set memberIds(ids: string[]) {
    this._memberIds = ids || [];
  }

  changeTypeaheadLoading(e: boolean): void {
    this.typeaheadLoading = e;
  }

  onMemberSelect(event) {
    if (!this.value) {
      return;
    }
    if ((event.key === 'Enter' || (event.value && event.item)) && this.value) {
      if (this.value.match(/^[\d]+$/)) {
        this._memberIds = [...this._memberIds, this.value];
        this.memberIdsChange.emit(this._memberIds);
      } else {
        this._members = [...this._members, this.value];
        this.membersChange.emit(this._members);
      }
      this.value = '';
      this.update.emit();
    }
  }

  updateMembers(target: string, values: string[]) {
    this[target] = values;
    if (target === '_members') {
      this.membersChange.emit(this._members);
    } else {
      this.memberIdsChange.emit(this._memberIds);
    }
    this.update.emit();
  }

}
