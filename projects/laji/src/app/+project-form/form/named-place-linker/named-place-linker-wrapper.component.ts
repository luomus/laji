import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BrowserService } from '../../../shared/service/browser.service';

@Component({
  selector: 'laji-named-place-linker-wrapper',
  template: `<laji-named-place-linker [documentID]="documentID"></laji-named-place-linker>`
})
export class NamedPlaceLinkerWrapperComponent implements OnInit {
  documentID: string;
  constructor(
    private route: ActivatedRoute,
    private browserService: BrowserService
  ) {}
  ngOnInit() {
    this.documentID = this.route.snapshot.params['document'];
  }

  linked() {
    this.browserService.goBack();
  }
}
