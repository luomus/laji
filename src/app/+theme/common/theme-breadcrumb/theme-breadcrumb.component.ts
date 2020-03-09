import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NavLink } from '../theme-form.service';
import { Breadcrumb } from '../monitoring-theme-base.component';

@Component({
  selector: 'laji-theme-breadcrumb',
  templateUrl: './theme-breadcrumb.component.html',
  styleUrls: ['./theme-breadcrumb.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeBreadcrumbComponent {

  @Input() breadcrumb: Breadcrumb[];
  @Input() set navLinks(links: NavLink[]) {
    this.active = links.find(l => l.active === true);
  }

  active: NavLink;

}
