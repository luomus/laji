import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LajiApi, LajiApiService } from '../../shared/service/laji-api.service';
import { map, startWith, tap } from 'rxjs/operators';
import { InformationItem } from '../../shared/model/InformationItem';

@Component({
  selector: 'laji-info-page',
  template: '<div [innerHtml]="content$ | async"></div>'
})
export class InfoPageComponent implements OnChanges {

  content$;

  @Input()
  rootPage: {fi: string, sv: string, en: string};

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

  ngOnChanges() {
    this.updatePage();
  }

  private updatePage() {
    const rootPageID = this.rootPage && this.rootPage[this.translateService.currentLang];
    const roots = this.rootPage && Object.keys(this.rootPage).map(key => this.rootPage[key]);
    const page = this.child || rootPageID;
    if (this.currentPage === page) {
      return;
    }
    this.currentPage = page;
    this.content$ = this.lajiApiService.get(LajiApi.Endpoints.information, page, {}).pipe(
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

}
