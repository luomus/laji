import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, of as ObservableOf, Subscription } from 'rxjs';
import { Logger } from '../shared/logger/logger.service';
import { Information } from '../shared/model/Information';
import { Title } from '@angular/platform-browser';
import { LajiApi, LajiApiService } from '../shared/service/laji-api.service';
import { catchError, delay, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';
import { HeaderService } from '../shared/service/header.service';

@Component({
  selector: 'laji-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InformationComponent {

  information$: Observable<Information>;

  constructor(private route: ActivatedRoute,
              private lajiApi: LajiApiService,
              private logger: Logger,
              private headerService: HeaderService,
              private title: Title
  ) {
    this.information$ = this.route.params.pipe(
      map(params => params['id']),
      switchMap(id => this.lajiApi.get(LajiApi.Endpoints.information, id).pipe(
        filter(info => info.id === id)
      )),
      delay(0),
      tap(info => this.updateHeaders(info)),
      catchError(err => {
        this.logger.warn('Failed to fetch root informations', err);
        return of(null);
      })
    );
  }

  private updateHeaders(info: Information): void {
    const pageTitle = info.title + ' | ' + this.title.getTitle();
    const paragraph = HeaderService.getDescription(info.content || '');

    this.title.setTitle(pageTitle);
    this.headerService.createTwitterCard(pageTitle);
    this.headerService.updateMetaDescription(paragraph);
  }

}
