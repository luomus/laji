import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable, of, Subscription, throwError } from 'rxjs';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { catchError, concat, delay, retryWhen, take, tap } from 'rxjs/operators';
import { Taxonomy } from '../../shared/model/Taxonomy';
import { TaxonomyApi } from '../../shared/api/TaxonomyApi';
import { Logger } from '../../shared/logger';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { FooterService } from '../../shared/service/footer.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'laji-taxonomy',
  templateUrl: './taxon.component.html',
  styleUrls: ['./taxon.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonComponent implements OnInit, OnDestroy {
  taxon: Taxonomy;
  isFromMasterChecklist: boolean;

  infoCardContext: string;
  infoCardTab: string;

  sidebarWidth = 225;
  showTree = true;
  canShowTree = true;

  loading = false;
  private initTaxonSub: Subscription;

  private onMouseMove = this.updateSidebarWidth.bind(this);
  private onMouseUp  = this.stopDragging.bind(this);

  private subParam: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private taxonService: TaxonomyApi,
    private logger: Logger,
    private title: Title,
    private translate: TranslateService,
    private footerService: FooterService,
    private cd: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit() {
    this.footerService.footerVisible = false;

    this.subParam = combineLatest(this.route.params, this.route.queryParams).subscribe(data => {
      this.infoCardTab = data[0]['tab'] || 'overview';
      this.infoCardContext = data[1]['context'] || 'default';
      this.showTree = data[1]['showTree'] === 'true';
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


  startDragging(e) {
    e.preventDefault();
    this.document.addEventListener(
      'mousemove', this.onMouseMove
    );
    this.document.addEventListener(
      'mouseup', this.onMouseUp
    );
  }

  private updateSidebarWidth(e) {
    e.preventDefault();
    this.sidebarWidth = Math.min(Math.max(e.pageX + 2, 120), 450);
    this.cd.detectChanges();
  }

  private stopDragging(e) {
    this.document.removeEventListener(
      'mousemove', this.onMouseMove
    );
    this.document.removeEventListener(
      'mouseup', this.onMouseUp
    );
  }

  toggleSidebar() {
    this.showTree = !this.showTree;
    this.updateRoute();
  }

  updateRoute(id = this.taxon.id, tab = this.infoCardTab, context = this.infoCardContext, showTree = this.showTree, replaceUrl = false) {
    const route = ['/taxon', id];
    const params = {};
    const extra = {};

    if (tab !== 'overview' && tab !== 'taxonomy') {
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

    this.router.navigate(
      this.localizeRouterService.translateRoute(
        route
      ),
      extra
    );
  }

  private initTaxon(taxonId: string): Observable<any> {
    return this.getTaxon(taxonId).pipe(
      tap(taxon => {
        this.taxon = taxon;
        this.isFromMasterChecklist = this.getIsFromMasterChecklist();
        this.canShowTree = this.taxon.hasParent || this.taxon.hasChildren;

        this.setTitle();
      })
    );
  }

  private setTitle() {
    let title = this.taxon.vernacularName && this.taxon.vernacularName[this.translate.currentLang] || '';
    title += title ? ' (' + this.taxon.scientificName + ')' : this.taxon.scientificName;
    this.title.setTitle((title ? title + ' | '  : '') + this.title.getTitle());
  }

  private getTaxon(id) {
    return this.taxonService
      .taxonomyFindBySubject(id, 'multi', {includeMedia: true, includeDescriptions: true, includeRedListEvaluations: true}).pipe(
        retryWhen(errors => errors.pipe(delay(1000), take(3), concat(throwError(errors)), ))).pipe(
        catchError(err => {
          this.logger.warn('Failed to fetch taxon by id', err);
          return of(false);
        }));
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
