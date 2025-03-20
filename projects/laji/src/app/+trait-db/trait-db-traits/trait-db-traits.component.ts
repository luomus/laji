import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { components } from 'projects/laji-api-client-b/generated/api';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { UserService } from '../../shared/service/user.service';

type Trait = components['schemas']['Trait'];
type TraitGroup = components['schemas']['TraitGroup'];

@Component({
  templateUrl: 'trait-db-traits.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TraitDbTraitsComponent implements OnInit, OnDestroy {
  private filteredTraits = new BehaviorSubject<Trait[] | undefined>(undefined);
  private activeTraitGroupIdFilter: BehaviorSubject<string> = new BehaviorSubject('');
  private activeTraitSubscription: Subscription | undefined;

  filteredTraits$: Observable<Trait[] | undefined> = this.filteredTraits.asObservable();
  loggedIn$: Observable<boolean>;
  traits: Trait[] | undefined;
  traitGroups: Record<string, TraitGroup> = {}; // indexed by id

  constructor(
    private api: LajiApiClientBService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {
    this.loggedIn$ = this.userService.isLoggedIn$;
  }

  ngOnInit() {
    this.api.get('/trait/trait-groups', {}).subscribe(groups => {
      groups.forEach(group => this.traitGroups[group.id] = group);
      this.cdr.markForCheck();
    });

    this.activeTraitSubscription = this.activeTraitGroupIdFilter.subscribe(filteredTraitGroupId => {
      if (this.traits === undefined) {
        return;
      }
      if (!filteredTraitGroupId) {
        this.filteredTraits.next(this.traits);
        return;
      }
      this.filteredTraits.next(this.traits.filter(trait => trait.group === filteredTraitGroupId));
    });

    this.api.get('/trait/traits', {}).subscribe(traits => {
      this.traits = traits;
      this.activeTraitGroupIdFilter.next(this.activeTraitGroupIdFilter.value);
    });
  }

  onSelectedGroupChange(event: Event) {
    this.activeTraitGroupIdFilter.next((event.target as HTMLSelectElement).value);
  }

  ngOnDestroy() {
    this.activeTraitSubscription?.unsubscribe();
  }
}

