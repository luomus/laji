import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FooterService } from '../../shared/service/footer.service';
import { UserService } from '../../shared/service/user.service';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { Document } from '../../shared/model/Document';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { LajiApi, LajiApiService } from '../../shared/service/laji-api.service';
import * as FileSaver from 'file-saver';
import { PlatformService } from '../../shared-modules/platform/platform.service';

@Component({
  selector: 'laji-viewer-print',
  templateUrl: './viewer-print.component.html',
  styleUrls: ['./viewer-print.component.css']
})
export class ViewerPrintComponent implements OnInit, OnDestroy {
  uri: string;
  own: boolean;
  showFacts = false;

  document: Document;

  loading = false;
  private subQuery: Subscription;

  constructor(
    private platformService: PlatformService,
    private footerService: FooterService,
    private route: ActivatedRoute,
    private documentService: DocumentApi,
    private userService: UserService,
    private lajiApiService: LajiApiService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.footerService.footerVisible = false;
    this.subQuery = this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.documentService.findById(id, this.userService.getToken())
          .subscribe(doc => {
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

  pdf(fileName) {
    this.loading = true;
    if (this.platformService.isBrowser) {
      this.lajiApiService.post(LajiApi.Endpoints.htmlToPdf, this.stripHTML(document.getElementsByTagName('html')[0].innerHTML))
        .subscribe((response) => {
          FileSaver.saveAs(response, fileName + '.pdf');
          this.loading = false;
          this.cd.markForCheck();
        }, () => {
          this.loading = false;
          this.cd.markForCheck();
        });
    }
  }

  toggleFacts() {
    this.showFacts = !this.showFacts;
  }

  private stripHTML(s: string) {
    // Strip scripts
    s = s.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    // Make absolute SVG ids relative
    s = s.replace(/xlink:href=".*?#/g, 'xlink:href="#');
    return s;
  }
}
