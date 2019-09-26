import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map, startWith, tap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'lu-sidebar-link',
  templateUrl: './sidebar-link.component.html',
  styleUrls: ['./sidebar-link.component.scss']
})
export class SidebarLinkComponent implements OnInit, OnDestroy {
  @Input() link: Array<string>;
  active = false;
  unsubscribe$ = new Subject<void>();
  constructor(private router: Router) {}
  ngOnInit() {
    const urls$ = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map((e: NavigationEnd) => e.urlAfterRedirects || e.url),
      startWith(this.router.url)
    );
    urls$.pipe(takeUntil(this.unsubscribe$)).subscribe((u: string) => {
      const substrs = u.split('/');
      this.active = u.includes(this.link[this.link.length - 1]);
    });
  }
  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
