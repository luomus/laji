import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LajiApi, LajiApiService } from '../../shared/service/laji-api.service';
import { map, tap } from 'rxjs/operators';
import { InformationItem } from '../../shared/model/InformationItem';
import { MultiLanguage } from '../../shared/model/MultiLanguage';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'laji-info-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div *ngIf="content$ | async; else loading; let content" [innerHtml]="content | safe:'html'" lajiRouteTransformer></div>
<ng-template #loading>
  <lu-ghost-paragraph [length]="10"></lu-ghost-paragraph>
  <lu-ghost-paragraph [length]="300"></lu-ghost-paragraph>
  <lu-ghost-paragraph [length]="200"></lu-ghost-paragraph>
</ng-template>
`
})
export class InfoPageComponent implements OnChanges {

  content$: Observable<string> = of('');
  _rootPage?: MultiLanguage;

  @Input()
  page?: string;

  @Output()
  parents = new EventEmitter<InformationItem[]>();
  @Output()
  subPages = new EventEmitter<InformationItem[]>();
  @Output()
  title = new EventEmitter<string>();
  @Output()
  hasContent = new EventEmitter<boolean>();

  private currentPage?: string;

  constructor(
    private translateService: TranslateService,
    private lajiApiService: LajiApiService
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

  private updatePage() {
    const roots = this.getRootPages();
    const activePage = this.getActivePage();

    if (!activePage || this.currentPage === activePage) {
      return;
    }

    this.currentPage = activePage;
    this.content$ = this.lajiApiService.get(LajiApi.Endpoints.information, this.lastFromPath(activePage), {}).pipe(
      tap(result => {
        this.title.emit(result.title);
        this.parents.emit(result.parents);
        this.subPages.emit(result.children || []);
      }),
      map(result => (result.content || '').trim()),
      tap(content => this.hasContent.emit(!!content))
    );
  }

  private lastFromPath(url: string): string {
    const parts = (url || '').split('/');

    return parts.pop() || '';
  }

  private getRootPages(): Set<string> {
    const roots = new Set<string>();
    if (this._rootPage) {
      Object.values(this._rootPage).forEach(root => roots.add(root));
    }
    return roots;
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
