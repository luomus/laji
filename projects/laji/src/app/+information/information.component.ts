import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Logger } from '../shared/logger/logger.service';
import { Information } from '../shared/model/Information';
import { Title } from '@angular/platform-browser';
import { LajiApi, LajiApiService } from '../shared/service/laji-api.service';
import { catchError, delay, filter, map, switchMap, tap } from 'rxjs/operators';
import { getDescription, HeaderService } from '../shared/service/header.service';

@Component({
  selector: 'laji-information',
  templateUrl: './information.component.html',
  styleUrls: ['../../styles/information.scss', './information.component.css'],
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
    const paragraph = getDescription(info.content || '');

    this.headerService.setHeaders({
      title: pageTitle,
      description: paragraph
    });
  }
}
