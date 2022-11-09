import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable, of, Subscription, throwError } from 'rxjs';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { catchError, concat, delay, filter, retryWhen, take, tap } from 'rxjs/operators';
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
  taxon: Taxonomy;
  isFromMasterChecklist: boolean;

  infoCardContext: string;
  infoCardTab: InfoCardTabType;

  showTree = false;
  canShowTree = true;

  showHidden = false;

  loading = false;
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
    private cd: ChangeDetectorRef,
    private cacheService: CacheService,
    private headerService: HeaderService,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit() {
    this.footerService.footerVisible = false;
    this.subParam = combineLatest(this.route.params, this.route.queryParams).subscribe(data => {
      this.infoCardTab = data[0]['tab'] || 'overview';
      this.infoCardContext = data[1]['context'] || 'default';
      this.showTree = data[1]['showTree'] === 'true';
      this.showHidden = data[1]['showHidden'] === 'true';
      this.cd.markForCheck();

      if (!this.taxon || data[0]['id'] !== this.taxon.id) {
        if (this.initTaxonSub) {
          this.initTaxonSub.unsubscribe();
        }
        this.loading = true;
        this.initTaxonSub = this.initTaxon(data[0]['id']).subscribe(() => {
          this.loading = false;
          this.cd.markForCheck();
        });
      }
    });
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

  private initTaxon(taxonId: string): Observable<Taxonomy> {
    return this.getTaxon(taxonId).pipe(
      filter(taxon => taxon !== null),
      tap(taxon => {
        this.taxon = taxon;
        this.isFromMasterChecklist = this.getIsFromMasterChecklist();
        this.canShowTree = this.taxon.hasParent || this.taxon.hasChildren;

        const d = taxon?.descriptions?.[0]?.groups?.[0]?.variables?.[0]?.content[this.translate.currentLang];
        this.headerService.setHeaders({
          description: d ? getDescription(d) : undefined,
          image: taxon?.multimedia?.[0]?.thumbnailURL
        });
      })
    );
  }

  private getTaxon(id: string): Observable<Taxonomy> {
    return this.taxonService.taxonomyFindBySubject(id, 'multi', {
      includeMedia: true,
      includeDescriptions: true,
      includeRedListEvaluations: true,
    }).pipe(
      retryWhen(errors => errors.pipe(delay(1000), take(3), concat(throwError(errors)), )),
      catchError(err => {
        this.logger.warn('Failed to fetch taxon by id', err);
        return of(null);
      })
    );
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
