import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { components } from 'projects/laji-api-client-b/generated/api';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { Observable } from 'rxjs';
import { map, filter, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { UserService } from '../../../shared/service/user.service';

export type Trait = components['schemas']['Trait'];

@Component({
  templateUrl: './trait-db-trait.component.html'
})
export class TraitDbTraitComponent implements OnInit {
  trait$!: Observable<Trait>;
  loggedIn$!: Observable<boolean>;

  constructor(
    private route: ActivatedRoute,
    private api: LajiApiClientBService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.trait$ = this.route.paramMap.pipe(
      map(m => m.get('id')),
      filter(id => !!id),
      distinctUntilChanged(),
      switchMap(id => this.api.get('/trait/traits/{id}', { path: { id: id! } }))
    );
    this.loggedIn$ = this.userService.isLoggedIn$;
  }
}

