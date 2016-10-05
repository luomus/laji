import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from 'ng2-translate';
import { UserService } from '../shared/service/user.service';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'laji-user',
  template: '',
})
export class UserComponent implements OnInit {
  constructor(private userService: UserService,
              private router: Router,
              private translate: TranslateService) {
  }

  ngOnInit() {
    // TODO remove when https://github.com/ocombe/ng2-translate/issues/232 is fixed
    this.translate.use(SharedModule.currentLang);
    this.userService.getUser().subscribe(
      user => this.router.navigate(['/user', user.id])
    );
  }
}
