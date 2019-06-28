import {Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { interval as ObservableInterval, of as ObservableOf, Subscription } from 'rxjs';

@Component({
  selector: 'laji-quick-links',
  templateUrl: './quick-links.component.html',
  styleUrls: ['./quick-links.component.scss']
})
export class QuickLinksComponent implements OnInit {
  showMoreInfo: Boolean = false;
  private subParams: Subscription;

  constructor(private router: Router) { }

  ngOnInit() {
    this.subParams = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.closeMenu();
      }
    });
  }

  toggleMoreInfo() {
    this.showMoreInfo = !this.showMoreInfo;
  }

  closeMenu() {
    this.showMoreInfo = false;
  }

}
