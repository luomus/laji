import { Component, ViewChild, AfterViewInit, Renderer2, OnChanges, SimpleChanges, Inject } from '@angular/core';
import { RouterLinkActive } from '@angular/router';

@Component({
  selector: 'lu-sidebar-link',
  templateUrl: './sidebar-link.component.html',
  styleUrls: ['./sidebar-link.component.scss'],
  providers: [RouterLinkActive]
})
export class SidebarLinkComponent {
  constructor(@Inject(RouterLinkActive) public active: RouterLinkActive) {}
}
