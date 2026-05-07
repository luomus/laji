import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { Observable, Subscription } from 'rxjs';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Form = components['schemas']['Form'];

enum Tabs {
  species = 'species',
  routes = 'routes',
  censuses = 'censuses'
}

@Component({
    selector: 'laji-wbc-result',
    templateUrl: './wbc-result.component.html',
    styleUrls: ['./wbc-result.component.css'],
    standalone: false
})
export class WbcResultComponent implements OnInit, OnDestroy {

  @Input() form!: Form;

  tab$!: Observable<keyof typeof Tabs>;

  Tabs = Tabs; // eslint-disable-line @typescript-eslint/naming-convention

  defaultTabSubscription!: Subscription;

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
