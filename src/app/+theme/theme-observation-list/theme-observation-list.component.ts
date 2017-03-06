import { Component, OnInit, Input, OnChanges, ViewChild } from '@angular/core';
import { ResultService } from '../service/result.service';
import { ModalDirective } from 'ng2-bootstrap/modal/modal.component';
import { Router } from '@angular/router';

@Component({
  selector: 'laji-theme-observation-list',
  templateUrl: './theme-observation-list.component.html',
  styleUrls: ['./theme-observation-list.component.css']
})
export class ThemeObservationListComponent implements OnInit, OnChanges {

  @ViewChild('documentModal') public modal: ModalDirective;

  @Input() grid: string;
  @Input() collectionId: string;
  @Input() taxonId: string;
  @Input() time: string;
  @Input() tbodyHeight = 400;
  @Input() page: number;

  loading = false;
  results = {results: []};
  shownDocument = '';
  highlightId = '';
  current: string;

  constructor(
    private resultService: ResultService,
    private router: Router
  ) { }

  ngOnInit() {
    this.updateDocuments();
  }

  ngOnChanges() {
    this.updateDocuments();
  }

  updateDocuments() {
    const key = this.grid + ':' + this.collectionId + ':' + this.taxonId + ':' + this.time + ':' + this.page;
    if (this.current === key) {
      return;
    }
    this.current = key;
    this.loading = true;
    this.resultService.getList(this.grid, this.collectionId, this.taxonId, this.time, this.page)
      .subscribe(data => {
        this.results = data;
        this.loading = false;
      },
      error => {
        this.loading = false;
      });
  }

  showDocument(documentId, highlightId) {
    this.shownDocument = documentId;
    this.highlightId = highlightId;
    this.modal.show();
  }

  pageChanged(pager) {
    this.router.navigate([], {queryParams: {
      grid: this.grid,
      time: this.time,
      taxonId: this.taxonId,
      page: pager.page
    }});
  }

}
