import { Component } from '@angular/core';
import { SearchQuery } from '../+observation/search-query.model';
import { NewsApi } from '../shared/api/NewsApi';
import { TranslateService } from 'ng2-translate';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'laji-home',
  providers: [
    SearchQuery,
    NewsApi
  ],
  styleUrls: ['./home.component.css'],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  constructor(public translate: TranslateService) {
  }

  ngOnInit() {
    // TODO remove when https://github.com/ocombe/ng2-translate/issues/232 is fixed
    this.translate.use(SharedModule.currentLang);
  }
}
