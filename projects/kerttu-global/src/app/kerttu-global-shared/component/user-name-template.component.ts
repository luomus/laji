import { ChangeDetectorRef, Component, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from 'projects/laji/src/app/shared/service/user.service';

@Component({
  selector: 'bsg-user-name-template',
  template: `
    <ng-template let-value="value" #userName>
      <span *ngIf="value" title="{{ value | label }}">
        <em *ngIf="value == userId else otherUser">{{ value | label }}</em>
        <ng-template #otherUser>{{ value | label }}</ng-template>
      </span>
    </ng-template>
  `
})
export class UserNameTemplateComponent implements OnDestroy {
  @ViewChild('userName', { static: true }) userNameTpl: TemplateRef<any>;

  userId?: string;

  private userIdSubscription: Subscription;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {
    this.userIdSubscription = this.userService.user$.pipe(
      map(user => user?.id)
    ).subscribe(userId => {
      this.userId = userId;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.userIdSubscription?.unsubscribe();
  }
}
