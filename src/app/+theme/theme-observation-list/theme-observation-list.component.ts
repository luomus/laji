import { Component, OnInit, Input, OnChanges, ViewChild, Output, EventEmitter } from '@angular/core';
import { ResultService } from '../service/result.service';
import { ModalDirective } from 'ngx-bootstrap/modal/modal.component';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';

@Component({
  selector: 'laji-theme-observation-list',
  templateUrl: './theme-observation-list.component.html',
  styleUrls: ['./theme-observation-list.component.css']
})
export class ThemeObservationListComponent implements OnInit, OnChanges {

  @ViewChild('documentModal') public modal: ModalDirective;

  @Input() query: WarehouseQueryInterface;
  @Input() type: string;
  @Input() tbodyHeight = 400;
  @Input() page: number;
  @Output() onListClose = new EventEmitter<WarehouseQueryInterface>();
  @Output() onPageChange = new EventEmitter<number>();

  loading = false;
  results = {results: []};
  shownDocument = '';
  highlightId = '';
  current: string;

  private subQuery: Subscription;

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
    const key = JSON.stringify(this.query) + ':' + this.page;
    if (this.current === key) {
      return;
    }
    if (this.subQuery) {
      this.subQuery.unsubscribe();
    }
    this.current = key;
    this.loading = true;
    this.subQuery = this.resultService.getList(this.query, this.page)
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
    this.onPageChange.emit(pager.page);
  }

}
