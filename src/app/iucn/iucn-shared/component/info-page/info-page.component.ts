import { Component, Input, OnChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LajiApi, LajiApiService } from '../../../../shared/service/laji-api.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'laji-info-page',
  templateUrl: './info-page.component.html',
  styleUrls: ['./info-page.component.css']
})
export class InfoPageComponent implements OnChanges {

  content$;

  @Input()
  pages: {fi: string, sv: string, en: string};

  constructor(
    private translateService: TranslateService,
    private lajiApiService: LajiApiService
  ) { }

  ngOnChanges() {
    this.updatePage();
  }

  private updatePage() {
    this.content$ = this.lajiApiService.get(LajiApi.Endpoints.information, this.pages[this.translateService.currentLang], {}).pipe(
      map(result => result.content)
    );
  }

}
