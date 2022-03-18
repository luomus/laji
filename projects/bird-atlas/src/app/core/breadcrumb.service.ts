import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

export enum BreadcrumbId {
  Home, SpeciesIndex, SpeciesInfo, GridIndex, GridInfo
}

export interface IBreadcrumb {
  translateId: string;
  name?: string;
  link: string[];
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService implements OnDestroy {
  private unsubscribe$ = new Subject<void>();

  breadcrumbs$ = new Subject<IBreadcrumb[]>();

  private currentStack: BreadcrumbId[] = [];
  private breadcrumbLookup: Record<BreadcrumbId, IBreadcrumb> = {
    [BreadcrumbId.Home]: {
      translateId: 'ba.breadcrumbs.home',
      link: ['']
    },
    [BreadcrumbId.SpeciesIndex]: {
      translateId: 'ba.breadcrumbs.speciesIndex',
      link: ['species']
    },
    [BreadcrumbId.SpeciesInfo]: {
      translateId: '',
      link: ['species']
    },
    [BreadcrumbId.GridIndex]: {
      translateId: 'ba.breadcrumbs.gridIndex',
      link: ['grid']
    },
    [BreadcrumbId.GridInfo]: {
      translateId: '',
      link: ['grid']
    }
  };

  constructor(private router: Router, private route: ActivatedRoute) {
    this.router.events.pipe(
      takeUntil(this.unsubscribe$),
      filter(e => e instanceof NavigationEnd),
      map(() => this.route.snapshot),
      map(r => {
        while (r.firstChild) { r = r.firstChild; }
        return r;
      }),
      map(snapshot => snapshot.data['breadcrumbStack'] || [])
    ).subscribe(stack => {
      this.currentStack = stack;
      this.updateBreadcrumbs();
    });
  }

  setBreadcrumbName(id: BreadcrumbId, name: string) {
    this.breadcrumbLookup[id].name = name;
    this.updateBreadcrumbs();
  }

  private updateBreadcrumbs() {
    this.breadcrumbs$.next(
      this.currentStack.map(id => this.breadcrumbLookup[id])
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.breadcrumbs$.complete();
  }
}
