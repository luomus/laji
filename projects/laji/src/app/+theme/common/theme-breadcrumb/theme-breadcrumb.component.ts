import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export interface Breadcrumb {
  link: string;
  label: string;
  active?: boolean;
}

@Component({
  selector: 'laji-theme-breadcrumb',
  templateUrl: './theme-breadcrumb.component.html',
  styleUrls: ['./theme-breadcrumb.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeBreadcrumbComponent {

  @Input() breadcrumb: Breadcrumb[];
  @Input() set navLinks(links: Breadcrumb[]) {
    this.active = links.find(l => l.active === true);
  }

  active: Breadcrumb;

}
