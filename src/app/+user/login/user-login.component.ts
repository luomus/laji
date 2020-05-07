import { Component, OnDestroy, OnInit } from '@angular/core';
import { FooterService } from '../../shared/service/footer.service';


@Component({
  selector: 'laji-user-login',
  templateUrl: './user-login.component.html'
})
export class UserLoginComponent implements OnInit, OnDestroy {
  constructor(
    private footerService: FooterService
  ) {
  }

  ngOnInit(): void {
    this.footerService.footerVisible = false;
  }

  ngOnDestroy(): void {
    this.footerService.footerVisible = true;
  }
}
