import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: 'ba-navbar',
  templateUrl: 'navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  openMenu: boolean = false;

  toggleMenu() {
    this.openMenu = !this.openMenu;
  }
}
