import { Component, OnInit, OnDestroy } from '@angular/core';
import { FooterService } from '../service/footer.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'laji-footer',
  styleUrls: ['./footer.component.css'],
  templateUrl: './footer.component.html'
})
export class FooterComponent implements OnInit, OnDestroy{

  public showPartners = true;
  public subRouteEvent: Subscription;

  constructor(
    public footerService: FooterService,
    private router: Router
  ) {}

  ngOnInit() {
    this.showPartners = this.router.isActive('/', true);
    this.subRouteEvent = this.router.events.subscribe(() => {
      this.showPartners = this.router.isActive('/', true);
    });
  }

  ngOnDestroy() {
    if (this.subRouteEvent) {
      this.subRouteEvent.unsubscribe();
    }
  }
}
