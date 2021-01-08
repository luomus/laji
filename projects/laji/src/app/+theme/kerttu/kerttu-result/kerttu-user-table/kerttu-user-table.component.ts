import {Component, OnInit, OnDestroy, ChangeDetectionStrategy, Input, ChangeDetectorRef, ViewChild, TemplateRef} from '@angular/core';
import {DatatableColumn} from '../../../../shared-modules/datatable/model/datatable-column';
import {UserService} from '../../../../shared/service/user.service';
import {forkJoin, Subscription} from 'rxjs';
import {tap} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {IUserStatistics} from '../../models';

interface IUserTableRow extends IUserStatistics {
  name?: string;
}

@Component({
  selector: 'laji-kerttu-user-table',
  templateUrl: './kerttu-user-table.component.html',
  styleUrls: ['./kerttu-user-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KerttuUserTableComponent implements OnInit, OnDestroy {
  @Input() userId: string;

  data: IUserTableRow[];
  columns: DatatableColumn[];
  sorts: {prop: string, dir: 'asc'|'desc'}[] = [{prop: 'totalAnnotationCount', dir: 'desc'}];
  loading = false;

  @Input() set userList(value: IUserStatistics[]) {
    this.data = [...value];
    this.updateNames();
  }

  @ViewChild('userName', { static: true }) userNameTpl: TemplateRef<any>;

  private nameSub: Subscription;

  constructor(
    private userService: UserService,
    private cd: ChangeDetectorRef,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.columns = [
      {
        name: 'name',
        label: 'theme.kerttu.result.name',
        cellTemplate: this.userNameTpl,
        summaryFunc: () => this.translate.instant('theme.total')
      },
      {
        name: 'letterAnnotationCount',
        label: 'theme.kerttu.result.letters',
        width: 70
      },
      {
        name: 'recordingAnnotationCount',
        label: 'theme.kerttu.result.recordings',
        width: 70
      },
      {
        name: 'totalAnnotationCount',
        label: 'theme.total',
        width: 70
      }
    ];
  }

  ngOnDestroy() {
    if (this.nameSub) {
      this.nameSub.unsubscribe();
    }
  }

  private updateNames() {
    if (this.nameSub) {
      this.nameSub.unsubscribe();
    }

    const obs = [];
    (this.data || []).forEach(user => {
      if (user.userId) {
        obs.push(this.userService.getPersonInfo(user.userId).pipe(
          tap(name => {
            user.name = name;
          })
        ));
      }
    });

    if (obs.length < 1) {
      this.loading = false;
      return;
    }

    this.loading = true;
    this.nameSub = forkJoin(obs).subscribe(() => {
      this.loading = false;
      this.cd.markForCheck();
    });
  }
}
