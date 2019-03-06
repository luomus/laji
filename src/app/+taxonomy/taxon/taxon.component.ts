import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  HostListener
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import {Subscription, combineLatest, Observable, of, throwError} from 'rxjs';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import {catchError, concat, delay, retryWhen, take, tap} from 'rxjs/operators';
import {Taxonomy} from '../../shared/model/Taxonomy';
import {TaxonomyApi} from '../../shared/api/TaxonomyApi';
import {Logger} from '../../shared/logger';
import {Title} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';
import {FooterService} from '../../shared/service/footer.service';

@Component({
  selector: 'laji-taxonomy',
  templateUrl: './taxon.component.html',
  styleUrls: ['./taxon.component.css']
})
export class TaxonComponent implements OnInit, OnDestroy {
  taxon: Taxonomy;
  isFromMasterChecklist: boolean;

  infoCardContext: string;
  infoCardTab: string;

  sidebarWidth = 225;
  showTree = true;

  loading = false;
  private initTaxonSub: Subscription;

  private dragging = false;
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
    private cd: ChangeDetectorRef
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
    this.footerService.footerVisible = false;
    if (this.subParam) {
      this.subParam.unsubscribe();
    }
    if (this.initTaxonSub) {
      this.initTaxonSub.unsubscribe();
    }
  }


  startDragging(e) {
    e.preventDefault();
    this.dragging = true;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e) {
    if (this.dragging) {
      e.preventDefault();
      this.sidebarWidth = Math.min(Math.max(e.pageX + 2, 120), 450);
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(e) {
    if (this.dragging) {
      this.dragging = false;
    }
  }

  toggleSidebar() {
    this.showTree = !this.showTree;
    this.updateRoute();
  }

  updateRoute(id = this.taxon.id, tab = this.infoCardTab, context = this.infoCardContext, showTree = this.showTree) {
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
      .taxonomyFindBySubject(id, 'multi', {includeMedia: true, includeDescriptions: true}).pipe(
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
