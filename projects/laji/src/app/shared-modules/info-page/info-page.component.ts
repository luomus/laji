import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LajiApi, LajiApiService } from '../../shared/service/laji-api.service';
import { map, startWith, tap } from 'rxjs/operators';
import { InformationItem } from '../../shared/model/InformationItem';
import { MultiLanguage } from '../../shared/model/MultiLanguage';
import { Observable } from 'rxjs';

@Component({
  selector: 'laji-info-page',
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

  content$: Observable<string>;
  _rootPage: MultiLanguage;

  @Input()
  child: string;

  @Output()
  parents = new EventEmitter<InformationItem[]>();
  @Output()
  children = new EventEmitter<InformationItem[]>();
  @Output()
  title = new EventEmitter<string>();
  @Output()
  hasContent = new EventEmitter<boolean>();

  private currentPage;

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
    const rootPageID = this._rootPage && this._rootPage[this.translateService.currentLang] || this._rootPage['fi'];
    const roots = this._rootPage && Object.keys(this._rootPage).map(key => this._rootPage[key]);
    const page = this.child || rootPageID;
    if (this.currentPage === page) {
      return;
    }
    this.currentPage = page;
    this.content$ = this.lajiApiService.get(LajiApi.Endpoints.information, this.lastFromPath(page), {}).pipe(
      tap(result => {
        let afterRoot = false;
        this.title.emit(result.title);
        this.parents.emit((result.parents || []).filter(item => {
          if (roots && roots.indexOf(item.id) !== -1) {
            afterRoot = true;
          }
          return afterRoot;
        }));
        this.children.emit(result.children || []);
        this.hasContent.emit(!!result.content.trim());
      }),
      map(result => result.content),
      startWith('')
    );
  }

  private lastFromPath(url: string) {
    const parts = (url || '').split('/');

    return parts.pop();
  }

}
