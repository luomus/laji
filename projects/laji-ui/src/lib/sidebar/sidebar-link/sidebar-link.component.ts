import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map, startWith, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Util } from 'projects/laji/src/app/shared/service/util.service';

@Component({
  selector: 'lu-sidebar-link',
  templateUrl: './sidebar-link.component.html',
  styleUrls: ['./sidebar-link.component.scss']
})
export class SidebarLinkComponent implements OnInit, OnDestroy {
  @Input() link!: Array<string>;
  @Input() linkParams?: {
    [k: string]: any;
  };
  @Input() active?: boolean = undefined;
  @Output() clicked = new EventEmitter<any>();

  unsubscribe$ = new Subject<void>();

  constructor(private router: Router) {}

  ngOnInit() {
    if (this.active !== undefined) {
      return;
    }
    const urls$ = this.router.events.pipe(
      filter(Util.eventIsNavigationEnd),
      map((e: NavigationEnd) => e.urlAfterRedirects || e.url),
      startWith(this.router.url)
    );
    urls$.pipe(takeUntil(this.unsubscribe$)).subscribe((u: string) => {
      this.active = u.includes(this.link[this.link.length - 1]);
    });
  }

  onClick(event: any) {
    this.clicked.next(event);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
