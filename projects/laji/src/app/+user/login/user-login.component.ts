import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FooterService } from '../../shared/service/footer.service';
import { Router } from '@angular/router';
import { PlatformService } from '../../shared/service/platform.service';
import { LocalizeRouterService } from '../../locale/localize-router.service';


@Component({
  selector: 'laji-user-login',
  templateUrl: './user-login.component.html'
})
export class UserLoginComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private footerService: FooterService,
    private router: Router,
    private platformService: PlatformService,
    private localizeRouterService: LocalizeRouterService
  ) {
  }

  ngOnInit(): void {
    this.footerService.footerVisible = false;
  }

  ngAfterViewInit() {
    if (this.platformService.isBrowser) {
      this.router.navigate(
        this.localizeRouterService.translateRoute(['/'])
      );
    }
  }

  ngOnDestroy(): void {
    this.footerService.footerVisible = true;
  }
}
