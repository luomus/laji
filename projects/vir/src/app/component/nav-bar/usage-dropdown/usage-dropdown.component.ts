import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UserService } from 'projects/laji/src/app/shared/service/user.service';

@Component({
  selector: 'vir-usage-dropdown',
  templateUrl: './usage-dropdown.component.html',
  styleUrls: [
    './usage-dropdown.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsageDropdownComponent {
  user$ = this.userService.user$;

  constructor(
    private userService: UserService
  ) {}
}
