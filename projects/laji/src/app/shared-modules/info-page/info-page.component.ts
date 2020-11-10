import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LajiApi, LajiApiService } from '../../shared/service/laji-api.service';
import { map, startWith, tap } from 'rxjs/operators';
import { InformationItem } from '../../shared/model/InformationItem';
import { HeaderService } from '../../shared/service/header.service';
import { Title } from '@angular/platform-browser';

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

  content$;
  _rootPage: {fi: string, sv: string, en: string};

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
    private lajiApiService: LajiApiService,
    private headerService: HeaderService,
    private metaTitle: Title
  ) { }

  @Input()
  set rootPage(roots: {fi: string, sv: string, en: string} | string) {
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
    const rootPageID = this._rootPage && this._rootPage[this.translateService.currentLang];
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

        if(result.title && !document.getElementsByTagName("laji-home").item(0)){
          this.metaTitle.setTitle(result.title + ' | ' + this.metaTitle.getTitle());
          this.headerService.createTwitterCard(result.title);
        }
        if(result.content && !document.getElementsByTagName("laji-home").item(0)) {
          this.headerService.updateMetaDescription(this.extractMetaDescription(result.content));
          setTimeout(() => {
            const image = (document.getElementsByTagName("laji-info-page")).item(0).getElementsByTagName("img").item(0).src;
            if (image) {
              this.headerService.updateFeatureImage(image);
            }
          },0)
        }
      }),
      map(result => result.content),
      startWith('')
    );
  }

  private lastFromPath(url: string) {
    const parts = (url || '').split('/');

    return parts.pop();
  }

  private extractMetaDescription(str) {
    str.substring(
      str.lastIndexOf("<p>") + 1, 
      str.lastIndexOf("</p>")-1
    );

    return str.replace(/<[^>]*>?/gm, '');
  }

}
