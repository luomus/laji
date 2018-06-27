import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Logger } from '../shared/logger/logger.service';
import { Information } from '../shared/model/Information';
import { InformationService } from './information.service';
import { Title } from '@angular/platform-browser';
import {LocalizeRouterService} from '../locale/localize-router.service';
import {LajiApi, LajiApiService} from '../shared/service/laji-api.service';

@Component({
  selector: 'laji-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InformationComponent implements OnDestroy {

  private static currentLang;

  information: Information;
  private paramSub: Subscription;

  constructor(private route: ActivatedRoute,
              private translate: TranslateService,
              private informationService: InformationService,
              private lajiApi: LajiApiService,
              private logger: Logger,
              private router: Router,
              private localizeRouterService: LocalizeRouterService,
              private cd: ChangeDetectorRef,
              private title: Title
  ) {
    this.paramSub = this.route.params.subscribe(params => {
      if (InformationComponent.currentLang && InformationComponent.currentLang !== this.translate.currentLang) {
        this.getInformation();
      } else {
        this.getInformation(params['id'] || null);
      }
      InformationComponent.currentLang = this.translate.currentLang;
    });
  }

  ngOnDestroy() {
    this.paramSub.unsubscribe();
  }

  private getInformation(id?) {
    const lang = this.translate.currentLang;
    (id ?
      (this.lajiApi.get(LajiApi.Endpoints.information, id, {lang})) :
      (this.lajiApi.getList(LajiApi.Endpoints.information, {lang})))
      .map(data => {
        if (data.children) {
          data.children = data.children.map(item => {
            item.id = this.informationService.getNiceUrl(item.id);
            return item;
          });
        }
        return data;
      })
      .subscribe(
        information => {
          if (!id && information.id) {
            this.router.navigate(this.localizeRouterService.translateRoute(['/about', information.id]));
          } else {
            this.information = information;
            this.title.setTitle(information.title + ' | ' + this.title.getTitle());
            this.cd.markForCheck();
          }
        },
        err => {
          this.logger.warn('Failed to fetch root informations', err);
          this.cd.markForCheck();
        }
      );
  }

}
