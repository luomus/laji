import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FooterService } from '../../shared/service/footer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PlatformService } from '../../root/platform.service';
import { LocalizeRouterService } from '../../locale/localize-router.service';


@Component({
  selector: 'laji-user-login',
  templateUrl: './user-login.component.html'
})
export class UserLoginComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private footerService: FooterService,
    private router: Router,
    private route: ActivatedRoute,
    private platformService: PlatformService,
    private localizeRouterService: LocalizeRouterService
  ) {
  }

  ngOnInit(): void {
    this.footerService.footerVisible = false;
  }

  ngAfterViewInit() {
    if (this.platformService.isBrowser) {
      const next = this.route.snapshot.queryParams['next'] || this.localizeRouterService.translateRoute('/');
      this.router.navigateByUrl(next);
    }
  }

  ngOnDestroy(): void {
    this.footerService.footerVisible = true;
  }
}
