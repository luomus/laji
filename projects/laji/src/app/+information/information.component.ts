import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Logger } from '../shared/logger/logger.service';
import { Title } from '@angular/platform-browser';
import { LajiApi, LajiApiService } from '../shared/service/laji-api.service';
import { catchError, delay, filter, map, switchMap, tap } from 'rxjs';
import { getDescription, HeaderService } from '../shared/service/header.service';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { components } from 'projects/laji-api-client-b/generated/api';
import { PlatformService } from '../root/platform.service';

type Information = components['schemas']['Information'];

@Component({
    selector: 'laji-information',
    templateUrl: './information.component.html',
    styleUrls: ['../../styles/information.scss', './information.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class InformationComponent {

  information$: Observable<Information|null>;

  constructor(private route: ActivatedRoute,
              private api: LajiApiClientBService,
              private logger: Logger,
              private headerService: HeaderService,
              private title: Title,
              private platform: PlatformService,
  ) {
    this.information$ = this.route.params.pipe(
      map(params => params['id']),
      switchMap(id => this.api.get('/information/{id}', { path: { id } }).pipe(
        filter(info => info.id === id)
      )),
      delay(0),
      tap(info => this.updateHeaders(info)),
      catchError(err => {
        if (err?.error?.statusCode === 404 && this.platform.isBrowser) {
          window.location.assign('https://info.laji.fi/');
        }
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
