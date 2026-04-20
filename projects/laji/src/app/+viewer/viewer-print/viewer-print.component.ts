import { Component, OnDestroy, OnInit } from '@angular/core';
import { FooterService } from '../../shared/service/footer.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { PlatformService } from '../../root/platform.service';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { StoreDocument } from '../../shared-modules/document-viewer/document-viewer.facade';

@Component({
    selector: 'laji-viewer-print',
    templateUrl: './viewer-print.component.html',
    styleUrls: ['./viewer-print.component.css'],
    standalone: false
})
export class ViewerPrintComponent implements OnInit, OnDestroy {
  uri: string | undefined;
  own: boolean | undefined;
  showFacts = false;
  document: StoreDocument | undefined;

  loading = false;
  private subQuery!: Subscription;

  constructor(
    private platformService: PlatformService,
    private footerService: FooterService,
    private route: ActivatedRoute,
    private api: LajiApiClientBService,
  ) {}

  ngOnInit() {
    this.footerService.footerVisible = false;
    this.subQuery = this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.api.get('/documents/{id}', { path: { id } }).subscribe(doc => {
          this.document = doc;
        });
      } else {
        this.uri = params['uri'];
        this.own = params['own'] === 'true';
      }
      if (params['showFacts']) {
        this.showFacts = params['showFacts'] === 'true';
      }
    });
  }

  ngOnDestroy() {
    if (this.subQuery) {
      this.subQuery.unsubscribe();
    }
    this.footerService.footerVisible = true;
  }

  print() {
    if (this.platformService.isBrowser) {
      window.print();
    }
  }

  toggleFacts() {
    this.showFacts = !this.showFacts;
  }
}
