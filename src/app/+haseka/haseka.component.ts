import { Component } from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { UserService } from '../shared/service/user.service';
import { FormApi } from '../shared/api/FormApi';
import { DocumentApi } from '../shared/api/DocumentApi';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'haseka',
  templateUrl: './haseka.component.html',
  styleUrls: ['./haseka.component.css'],
  providers: [FormApi, DocumentApi]
})
export class HasekaComponent {

  public email: string;

  constructor(public userService: UserService,
              private formService: FormApi,
              private translate: TranslateService) {
  }

  ngOnInit() {
    // TODO remove when https://github.com/ocombe/ng2-translate/issues/232 is fixed
    this.translate.use(SharedModule.currentLang);
  }
}
