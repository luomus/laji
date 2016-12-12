import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Logger } from '../shared/logger/logger.service';
import { InformationApi } from '../shared/api/InformationApi';
import { Information } from '../shared/model/Information';
import { InformationService } from './information.service';

@Component({
  selector: 'laji-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.css'],
  providers: [InformationApi]
})
export class InformationComponent implements OnDestroy {

  information: Information;
  private paramSub: Subscription;
  private transSub: Subscription;

  constructor(private route: ActivatedRoute,
              private informationApi: InformationApi,
              private translate: TranslateService,
              private informationService: InformationService,
              private logger: Logger
  ) {
    this.paramSub = this.route.params.subscribe(params => {
      this.getInformation(params['id'] || null);
    });
    this.transSub = this.translate.onLangChange.subscribe(
      () => {
        this.getInformation();
      }
    );
  }

  ngOnDestroy() {
    this.paramSub.unsubscribe();
    this.transSub.unsubscribe();
  }

  private getInformation(id?) {
    let lang = this.translate.currentLang;
    (id ?
      (this.informationApi.informationFindById(this.informationService.resolveId(id, lang), lang)) :
      (this.informationApi.informationFindAll(lang)))
      .map(data => {
        if (data.children) {
          data.children = data.children.map(item => {
            item.id = this.informationService.getNiceUrl(item.id);
            return item;
          });
        }
        console.log(data);
        return data;
      })
      .subscribe(
        information => this.information = information,
        err => this.logger.warn('Failed to fetch root informations', err)
      );
  }

}
