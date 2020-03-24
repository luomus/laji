import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NavLink } from '../common/theme-form.service';

@Component({
  template: `
    <laji-theme-page
      [title]="'theme.kerttu' | translate"
      [showNav]="true"
      [navLinks]="navLinks">
      <router-outlet></router-outlet>
    </laji-theme-page>
  `,
  styles: [`
    :host {
        display: flex;
        flex: 1 0 auto;
        width: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KerttuComponent implements OnInit {
  navLinks: NavLink[] = [
    {
      routerLink: ['instructions'],
      label: 'instructions'
    },
    {
      routerLink: ['annotate'],
      label: 'theme.kerttu.annotate'
    }
  ];

  constructor(

  ) { }

  ngOnInit() {
  }
}
