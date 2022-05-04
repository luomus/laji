import { Component, OnDestroy, OnInit } from '@angular/core';
import { FooterService } from '../../shared/service/footer.service';
import { UserService } from '../../shared/service/user.service';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { Document } from '../../shared/model/Document';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { PlatformService } from '../../root/platform.service';

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

  toggleFacts() {
    this.showFacts = !this.showFacts;
  }
}
