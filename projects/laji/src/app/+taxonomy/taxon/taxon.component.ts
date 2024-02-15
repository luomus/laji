import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable, of, Subscription, throwError } from 'rxjs';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { map, catchError, concat, delay, filter, retryWhen, take, tap, switchMap } from 'rxjs/operators';
import { Taxonomy } from '../../shared/model/Taxonomy';
import { TaxonomyApi } from '../../shared/api/TaxonomyApi';
import { Logger } from '../../shared/logger';
import { TranslateService } from '@ngx-translate/core';
import { FooterService } from '../../shared/service/footer.service';
import { DOCUMENT } from '@angular/common';
import { CacheService } from '../../shared/service/cache.service';
import { InfoCardTabType } from './info-card/info-card.component';
import { getDescription, HeaderService } from '../../shared/service/header.service';

@Component({
  selector: 'laji-taxonomy',
  templateUrl: './taxon.component.html',
  styleUrls: ['./taxon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonComponent implements OnInit, OnDestroy {
  taxon: Taxonomy | null;
  isFromMasterChecklist: boolean;
  infoCardContext: string;
  infoCardTab: InfoCardTabType;
  showTree = false;
  canShowTree = true;
  showHidden = false;
  loading = false;
  errorWas404 = false;

  private initTaxonSub: Subscription;
  private subParam: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private taxonService: TaxonomyApi,
    private logger: Logger,
    private translate: TranslateService,
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
        this.canShowTree = this.taxon.hasParent || this.taxon.hasChildren;
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

  updateRoute(id = this.taxon.id, tab = this.infoCardTab, context = this.infoCardContext, showTree = this.showTree, replaceUrl = false, showHidden = this.showHidden) {
    const route = ['/taxon', id];
    const params = {};
    const extra = {};

    if (tab !== 'overview') {
      route.push(tab);
    }
    if (context !== 'default' && id === this.taxon.id) {
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

  private setHeaders(taxon: Taxonomy) {
    const d = taxon?.descriptions?.[0]?.groups?.[0]?.variables?.[0]?.content[this.translate.currentLang];
    this.headerService.setHeaders({
      description: d ? getDescription(d) : undefined,
      image: taxon?.multimedia?.[0]?.thumbnailURL
    });
  }

  private getTaxon(id: string): Observable<Taxonomy> {
    return this.taxonService.taxonomyFindBySubject(id, 'multi', {
      includeMedia: true,
      includeDescriptions: true,
      includeRedListEvaluations: true,
    });
  }

  private getIsFromMasterChecklist() {
    const masterChecklist = 'MR.1';
    if (!this.taxon) {
      return false;
    }
    if (this.taxon.checklist) {
      return this.taxon.checklist.indexOf(masterChecklist) > -1;
    }
    return this.taxon.nameAccordingTo === masterChecklist;
  }

}
