import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { Logger } from '../shared/logger/logger.service';
import { InformationApi } from '../shared/api/InformationApi';
import { Information } from '../shared/model/Information';
import { InformationService } from './information.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'laji-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.css'],
  providers: [InformationApi],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InformationComponent implements OnDestroy {

  information: Information;
  private paramSub: Subscription;
  private transSub: Subscription;

  constructor(private route: ActivatedRoute,
              private informationApi: InformationApi,
              private translate: TranslateService,
              private informationService: InformationService,
              private logger: Logger,
              private cd: ChangeDetectorRef,
              private title: Title
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
    const lang = this.translate.currentLang;
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
        return data;
      })
      .subscribe(
        information => {
          this.information = information;
          this.title.setTitle(information.title + ' | ' + this.title.getTitle());
          this.cd.markForCheck();
        },
        err => {
          this.logger.warn('Failed to fetch root informations', err);
          this.cd.markForCheck();
        }
      );
  }

}
