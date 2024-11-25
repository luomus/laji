import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LajiApi, LajiApiService } from '../../shared/service/laji-api.service';
import { map, tap } from 'rxjs/operators';
import { InformationItem } from '../../shared/model/InformationItem';
import { MultiLanguage } from '../../shared/model/MultiLanguage';
import { Subscription } from 'rxjs';

const filterParentsAboveId = (excludeIds: string[], parents: any[]): any[] => {
  const out = [];
  for (let i = 0; i < parents.length; i++) {
    const elem = parents[parents.length - 1 - i];
    if (excludeIds.includes(elem.id)) {
      break;
    }
    out.push(elem);
  }
  return out.reverse();
};

@Component({
  selector: 'laji-info-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div *ngIf="!loadingContent else loading" [innerHtml]="content | safe:'html'" lajiRouteTransformer></div>
<ng-template #loading>
  <laji-info-page-loading></laji-info-page-loading>
</ng-template>
`
})
export class InfoPageComponent implements OnChanges, OnDestroy {

  content = '';
  loadingContent = false;
  _rootPage?: MultiLanguage;

  // filter out parents above excludeParentId in the hierarchy
  @Input() excludeParentIds?: string[];
  @Input() page?: string;

  @Output()
  parents = new EventEmitter<InformationItem[]>();
  @Output()
  subPages = new EventEmitter<InformationItem[]>();
  @Output()
  title = new EventEmitter<string>();
  @Output()
  hasContent = new EventEmitter<boolean>();

  private currentPage?: string;
  private contentSub?: Subscription;

  constructor(
    private translateService: TranslateService,
    private lajiApiService: LajiApiService,
    private cdr: ChangeDetectorRef
  ) { }

  @Input()
  set rootPage(roots: MultiLanguage | string) {
    if (typeof roots === 'string') {
      this._rootPage = {fi: roots, en: roots, sv: roots};
    } else {
      this._rootPage = roots;
    }
  }

  ngOnChanges() {
    this.updatePage();
  }

  ngOnDestroy() {
    if (this.contentSub) {
      this.contentSub.unsubscribe();
    }
  }

  private updatePage() {
    const activePage = this.getActivePage();

    if (this.currentPage === activePage) {
      return;
    }

    this.currentPage = activePage;
    this.loadContent(this.currentPage);
  }

  private loadContent(page: string) {
    if (this.contentSub) {
      this.contentSub.unsubscribe();
    }

    if (!page) {
      this.loadingContent = false;
      return;
    }

    this.loadingContent = true;
    this.contentSub = this.lajiApiService.get(LajiApi.Endpoints.information, this.lastFromPath(page), {}).pipe(
      tap(result => {
        this.title.emit(result.title);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.parents.emit(this.excludeParentIds ? filterParentsAboveId(this.excludeParentIds, result.parents!) : result.parents);
        this.subPages.emit(result.children || []);
      }),
      map(result => (result.content || '').trim()),
      tap(content => this.hasContent.emit(!!content))
    ).subscribe(content =>  {
      this.content = content;
      this.loadingContent = false;
      this.cdr.markForCheck();
    });
  }

  private lastFromPath(url: string): string {
    const parts = (url || '').split('/');

    return parts.pop() || '';
  }

  private getActivePage(): string {
    if (this.page) {
      return this.page;
    }
    const lang = this.translateService.currentLang as keyof MultiLanguage;
    if (this._rootPage) {
      return this._rootPage[lang] || this._rootPage['fi'] || '';
    }
    return '';
  }

}
