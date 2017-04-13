import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'laji-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css']
})
export class ViewerComponent implements OnInit, OnDestroy {

  public uri: string;
  public highlight: string;
  private subQuery: Subscription;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.subQuery = this.route.queryParams.subscribe(params => {
      this.uri = params['uri'] || '';
      this.highlight = (params['highlight'] || '').replace('_', '#');
    });
  }

  ngOnDestroy() {
    if (this.subQuery) {
      this.subQuery.unsubscribe();
    }
  }

}
