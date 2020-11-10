import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { TaxonomySearchQuery } from './service/taxonomy-search-query';
import { FooterService } from '../../shared/service/footer.service';
import { HeaderService } from '../../../app/shared/service/header.service'
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

const tabNameToIndex = {
  list: 0,
  images: 1,
};
const tabIndexToName = {
  0: 'list',
  1: 'images',
};

@Component({
  selector: 'laji-taxon-browse',
  templateUrl: './species.component.html',
  styleUrls: ['./species.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesComponent implements OnInit, OnDestroy {
  public selectedIndex = 0;

  private subParams: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public searchQuery: TaxonomySearchQuery,
    private cd: ChangeDetectorRef,
    private footerService: FooterService,
    private headerService: HeaderService,
    private title: Title,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.footerService.footerVisible = false;

    this.subParams = this.route.params.pipe(
      map(data => data['tab']),
    ).subscribe(tab => {
        this.selectedIndex = tabNameToIndex[tab];
        this.headerService.createTwitterCard(this.title.getTitle());
        setTimeout(() => {
          let paragraph = (document.getElementsByTagName("main")).item(0).getElementsByTagName("p").item(0).innerText;
          this.headerService.updateMetaDescription(this.translate.instant(paragraph));
        })
        this.cd.markForCheck();
    });

    this.searchQuery.setQueryFromParams(this.route.snapshot.queryParams);
  }

  ngOnDestroy() {
    this.footerService.footerVisible = true;

    if (this.subParams) {
      this.subParams.unsubscribe();
    }
  }

  @HostListener('window:popstate')
  onPopState() {
    // Route snapshot is not populated with the latest info when this event is triggered. So we need to delay the execution little.
    setTimeout(() => {
      this.searchQuery.setQueryFromParams(this.route.snapshot.queryParams);
      this.cd.markForCheck();
    });
  }

  onSelect(tabIndex: number) {
    this.router.navigate(['taxon', tabIndexToName[tabIndex]], {queryParams: this.route.snapshot.queryParams});
  }
}
