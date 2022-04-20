import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'ba-navbar',
  templateUrl: 'navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent implements OnDestroy {
  private unsubscribe$ = new Subject<void>();

  openMenu = false;

  constructor(router: Router) {
    router.events.pipe(takeUntil(this.unsubscribe$)).subscribe(e => {
      if (e instanceof NavigationStart) {
        this.openMenu = false;
      }
    });
  }

  toggleMenu() {
    this.openMenu = !this.openMenu;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
