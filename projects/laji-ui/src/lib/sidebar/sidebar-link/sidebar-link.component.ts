import { Component, OnInit, Input } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map, startWith, tap } from 'rxjs/operators';

@Component({
  selector: 'lu-sidebar-link',
  templateUrl: './sidebar-link.component.html',
  styleUrls: ['./sidebar-link.component.scss']
})
export class SidebarLinkComponent implements OnInit {
  @Input() link: Array<string>;
  active = false;
  constructor(private router: Router) {}
  ngOnInit() {
    const urls$ = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map((e: NavigationEnd) => e.urlAfterRedirects || e.url),
      startWith(this.router.url)
    );
    urls$.subscribe((u: string) => {
      const substrs = u.split('/');
      this.active = u.includes(this.link[this.link.length - 1]);
    });
  }
}
