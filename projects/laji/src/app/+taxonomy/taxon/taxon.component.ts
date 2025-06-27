import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable, of, Subscription, throwError } from 'rxjs';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { map, catchError, concat, delay, filter, retryWhen, take, tap, switchMap } from 'rxjs/operators';
import { Logger } from '../../shared/logger';
import { FooterService } from '../../shared/service/footer.service';
import { InfoCardTabType } from './info-card/info-card.component';
import { getDescription, HeaderService } from '../../shared/service/header.service';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Taxon = components['schemas']['Taxon'];

@Component({
  selector: 'laji-taxonomy',
  templateUrl: './taxon.component.html',
  styleUrls: ['./taxon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonComponent implements OnInit, OnDestroy {
  taxon: Taxon | null | undefined;
  isFromMasterChecklist: boolean | undefined;
  infoCardContext!: string;
  infoCardTab!: InfoCardTabType;
  showTree = false;
  canShowTree = true;
  showHidden = false;
  loading = false;

  private initTaxonSub: Subscription | undefined;
  private subParam!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private api: LajiApiClientBService,
    private logger: Logger,
    private footerService: FooterService,
    private cdr: ChangeDetectorRef,
    private headerService: HeaderService
  ) { }

  ngOnInit() {
    this.footerService.footerVisible = false;
    this.subParam = combineLatest(
      [this.route.params, this.route.queryParams]
    ).pipe(
      tap(params => {
        this.infoCardTab = params[0]['tab'] || 'overview';
        this.infoCardContext = params[1]['context'] || 'default';
        this.showTree = params[1]['showTree'] === 'true';
        this.showHidden = params[1]['showHidden'] === 'true';
        this.cdr.markForCheck();
      }),
      map(params => params[0]['id']),
      filter(id => !this.taxon || id !== this.taxon.id),
      tap(_ => this.loading = true),
      switchMap(id => this.getTaxon(id)),
      catchError(error => (
        // if the error was a 404 we don't need to retry
        error.status === 404 ? of(null) : throwError(error)
      )),
      retryWhen(errors => errors.pipe(delay(1000), take(3), concat(throwError(errors)), )),
      catchError(error => {
        this.logger.warn('Failed to fetch taxon by id', error);
        return of(null);
      }),
      tap(taxon => {
        this.taxon = taxon;
        this.loading = false;
        this.cdr.markForCheck();

        if (taxon === null) {
          return;
        }

        this.isFromMasterChecklist = this.getIsFromMasterChecklist();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.canShowTree = this.taxon!.hasParent || this.taxon!.hasChildren!;
        this.setHeaders(taxon);
      })
    ).subscribe();
  }

  ngOnDestroy() {
    this.footerService.footerVisible = true;
    if (this.subParam) {
      this.subParam.unsubscribe();
    }
    if (this.initTaxonSub) {
      this.initTaxonSub.unsubscribe();
    }
  }

  updateRoute(id = this.taxon?.id, tab = this.infoCardTab, context = this.infoCardContext, showTree = this.showTree, replaceUrl = false, showHidden = this.showHidden) {
    const route = ['/taxon', id];
    const params: any = {};
    const extra: any = {};

    if (tab !== 'overview') {
      route.push(tab);
    }
    if (context !== 'default' && id === this.taxon?.id) {
      params['context'] = context;
    }
    if (showTree) {
      params['showTree'] = true;
    }
    if (Object.keys(params).length > 0) {
      extra['queryParams'] = params;
    }
    if (replaceUrl) {
      extra['replaceUrl'] = true;
    }
    if (showHidden) {
      params['showHidden'] = true;
    }

    this.router.navigate(
      this.localizeRouterService.translateRoute(
        route
      ),
      extra
    );
  }

  private setHeaders(taxon: Taxon) {
    const d = taxon?.descriptions?.[0]?.groups?.[0]?.variables?.[0]?.content;
    this.headerService.setHeaders({
      description: d ? getDescription(d) : undefined,
      image: taxon?.multimedia?.[0]?.thumbnailURL
    });
  }

  private getTaxon(id: string): Observable<Taxon> {
    return this.api.get('/taxa/{id}', { path: { id }, query: {
      includeMedia: true,
      includeDescriptions: true,
      includeRedListEvaluations: true
    }});
  }

  private getIsFromMasterChecklist() {
    const masterChecklist = 'MR.1';
    if (!this.taxon) {
      return false;
    }
    return this.taxon.nameAccordingTo === masterChecklist;
  }
}
