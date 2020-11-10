import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Form } from '../../../shared/model/Form';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';

enum Tabs {
  species = 'species',
  routes = 'routes',
  censuses = 'censuses'
}

@Component({
  selector: 'laji-wbc-result',
  templateUrl: './wbc-result.component.html',
  styleUrls: ['./wbc-result.component.css']
})
export class WbcResultComponent implements OnInit, OnDestroy {

  @Input() form: Form.SchemaForm;

  tab$: Observable<keyof typeof Tabs>;

  Tabs = Tabs;

  defaultTabSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.tab$ = this.route.queryParams.pipe(map(paramMap => paramMap['tab']));
    this.defaultTabSubscription = this.tab$.subscribe(tab => {
      if (!Tabs[tab]) {
        this.router.navigate(
          [],
          {queryParams: {tab: Tabs.species}}
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.defaultTabSubscription.unsubscribe();
  }
}
