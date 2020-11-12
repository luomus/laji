import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of as ObservableOf, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Logger } from '../shared/logger/logger.service';
import { Information } from '../shared/model/Information';
import { Title } from '@angular/platform-browser';
import { LajiApi, LajiApiService } from '../shared/service/laji-api.service';
import { distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';
import { InformationStore } from './information.store';
import { HeaderService } from '../shared/service/header.service';

@Component({
  selector: 'laji-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InformationComponent implements OnDestroy {

  information$: Observable<Information>;
  private paramSub: Subscription;
  private id: number;
  private informationLoaded = false;

  constructor(private route: ActivatedRoute,
              private translate: TranslateService,
              private lajiApi: LajiApiService,
              private logger: Logger,
              private cd: ChangeDetectorRef,
              private title: Title,
              private store: InformationStore,
              private headerService: HeaderService
  ) {

    this.information$ = this.store.state$.pipe(
      map(state => state.info),
      distinctUntilChanged(),
      filter(info => !!info),
      tap(info => this.title.setTitle(info.title + ' | ' + this.title.getTitle()))
    );

    this.paramSub = this.route.params.pipe(
      map(params => params['id']),
      tap(id => this.id = +id),
      switchMap(id => this.getInformation(id))
    )
      .subscribe(information => {
          this.informationLoaded = true;
          this.store.setInformation(information);
        },
        err => {
          this.logger.warn('Failed to fetch root informations', err);
          this.cd.markForCheck();
        });

    setTimeout(() => {
        const paragraph = ((document.getElementsByClassName("laji-information").item(0).innerHTML)).replace(/(<([^>]+)>)/gi, "");
        const image = (document.getElementsByClassName("laji-information")).item(0).getElementsByTagName("img")?.item(0)?.src;
        this.headerService.createTwitterCard(this.title.getTitle());
        this.headerService.updateMetaDescription(paragraph);
        if (image) {
          this.headerService.updateFeatureImage(image);
        }
      }, 0);    
  }

  ngOnDestroy() {
    if (this.paramSub) {
      this.paramSub.unsubscribe();
    }
  }

  private getInformation(id): Observable<Information> {
    if (this.store.state.info && this.store.state.info.id === id) {
      return ObservableOf(this.store.state.info);
    }
    return this.lajiApi.get(LajiApi.Endpoints.information, id, {lang: this.translate.currentLang});
  }

}
