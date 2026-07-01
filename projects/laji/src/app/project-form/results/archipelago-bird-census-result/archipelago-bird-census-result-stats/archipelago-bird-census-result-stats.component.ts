import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject, combineLatest, forkJoin, map, mergeMap, Observable, of, shareReplay, switchMap, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { components } from 'projects/laji-api-client/generated/api';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';
import { FormPermissionService, Rights } from 'projects/laji/src/app/shared/service/form-permission.service';
import { toHtmlSelectElement } from 'projects/laji/src/app/shared/service/html-element.service';
import { ProjectFormService } from 'projects/laji/src/app/shared/service/project-form.service';
import { UserService } from 'projects/laji/src/app/shared/service/user.service';

type Form = components['schemas']['Form'];

interface NamedPlaceResults {
  id?: string;
  name: string;
  alternativeIDs?: string[];
}

interface RowItem {
  taxonVerbatim: string;
  dateBegin: string;
  observations: string;
  notes: string;
}

interface TaxonomicOrder {
  id: string;
  taxonomicOrder: number;
}

interface UserData {
  loggedIn: boolean;
  rights: Rights;
  form: Form;
}

@Component({
  selector: 'laji-archipelago-bird-census-result-stats',
  templateUrl: './archipelago-bird-census-result-stats.component.html',
  styleUrls: ['./archipelago-bird-census-result-stats.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class ArchipelagoBirdCensusResultStatsComponent implements OnInit, OnChanges {
  @Input() collectionStartYear!: number;
  @Input() year: string | undefined;
  @Input() route: string | undefined;
  @Input() namedPlace: string | undefined;

  @Output() yearChange = new EventEmitter<string>();
  @Output() routeChange = new EventEmitter<string>();
  @Output() namedPlaceChange = new EventEmitter<string>();

  toHtmlSelectElement = toHtmlSelectElement;

  readonly year$ = new BehaviorSubject<string | undefined>(undefined);
  readonly route$ = new BehaviorSubject<string | undefined>(undefined);
  readonly namedPlace$ = new BehaviorSubject<string | undefined>(undefined);

  userData$!: Observable<UserData | undefined>;
  routeOptions$!: Observable<{ label: string; value: string }[]>;
  namedPlaceOptions$!: Observable<{ label: string; value: string }[]>;
  taxonomicOrder$!: Observable<TaxonomicOrder[]>;
  rows$!: Observable<RowItem[]>;
  defaultYear?: string;
  defaultRoute?: string;
  defaultNamedPlace?: string;
  yearOptions!: { label: string; value: string }[];
  currentYear!: number;
  loading$ = new BehaviorSubject(false);

  columns = [
    { name: 'taxonVerbatim', label: 'archipelago.stats.table.cols.taxon', maxWidth: 250 },
    { name: 'dateBegin', label: 'archipelago.stats.table.cols.date', maxWidth: 125 },
    { name: 'observations', label: 'archipelago.stats.table.cols.observations' },
    { name: 'notes', label: 'archipelago.stats.table.cols.notes' }
  ];

  constructor(
    private api: LajiApiClientService,
    private activatedRoute: ActivatedRoute,
    private formPermissionService: FormPermissionService,
    private projectFormService: ProjectFormService,
    private translate: TranslateService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.userData$ = this.userService.isLoggedIn$.pipe(
      mergeMap(loggedIn => this.projectFormService.getFormFromRoute$(this.activatedRoute).pipe(
        mergeMap(form => !form ? of(undefined) : this.formPermissionService.getRights(form).pipe(
          map((rights) => ({
            loggedIn,
            rights,
            form
          }))
        ))
      ))
    );

    this.currentYear = new Date().getFullYear();
    this.defaultYear = this.year$.getValue() !== undefined ? this.year$.getValue() : '';
    this.defaultRoute = this.route$.getValue() !== undefined ? this.route$.getValue() : '';
    this.defaultNamedPlace = this.namedPlace$.getValue() !== undefined ? this.namedPlace$.getValue() : '';

    const yearsFromStartYear = [''].concat(
      Array.from(
        { length: this.currentYear - this.collectionStartYear + 1 },
        (_, i) => (+this.collectionStartYear + i).toString()
      ).reverse()
    );

    this.yearOptions = yearsFromStartYear.map(v => {
      if (v === '') {
        return { label: this.translate.instant('archipelago.stats.year.empty.label'), value: '' };
      } else {
        return { label: v, value: v };
      }
    });

    const namedPlaces$ = this.getNamedPlaces$().pipe(shareReplay(1));

    this.routeOptions$ = namedPlaces$.pipe(
      map(_namedPlaces => {
        const allIds = _namedPlaces.flatMap(p => p.alternativeIDs ?? []);
        const unique = [...new Set(allIds)].sort();
        return unique.map(id => ({ label: id, value: id }));
      })
    );

    this.namedPlaceOptions$ = combineLatest([namedPlaces$, this.route$]).pipe(
      map(([_namedPlaces, _route]) => {
        const filtered = _route
          ? _namedPlaces.filter(p => (p.alternativeIDs ?? []).includes(_route))
          : _namedPlaces;
        return filtered.map(p => ({ label: p.name, value: p.id ?? '' }));
      })
    );

    this.taxonomicOrder$ = this.getTaxonomicOrder$().pipe(shareReplay(1));

    this.rows$ = combineLatest([this.year$, this.route$, this.namedPlace$]).pipe(
      switchMap(([_year, _route, _namedPlace]) => {
        if (!_year || !_namedPlace) {
          return of([] as RowItem[]);
        }
        return this.getRowItems$(_year, _namedPlace);
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['year']) {
      this.year$.next(changes['year'].currentValue);
    }
    if (changes['route']) {
      this.route$.next(changes['route'].currentValue);
    }
    if (changes['namedPlace']) {
      this.namedPlace$.next(changes['namedPlace'].currentValue);
    }
  }

  onYearChange(event: Event): void {
    const year = this.toHtmlSelectElement(event.target).value;
    this.yearChange.emit(year);
  }

  onRouteChange(event: Event): void {
    const route = this.toHtmlSelectElement(event.target).value;
    this.route$.next(route);
    this.routeChange.emit(route);
    this.defaultNamedPlace = '';
  }

  onNamedPlaceChange(event: Event): void {
    const namedPlace = this.toHtmlSelectElement(event.target).value;
    this.namedPlaceChange.emit(namedPlace);
  }

  login() {
    this.userService.redirectToLogin();
  }

  getNamedPlaces$(): Observable<NamedPlaceResults[]> {
    return this.api.get('/named-places', {
      query: {
        page: 1,
        pageSize: 1000,
        collectionID: 'HR.6920',
        selectedFields: 'id,name,alternativeIDs'
      }
    }).pipe(
      map(response => response.results)
    );
  }

  getTaxonomicOrder$(): Observable<TaxonomicOrder[]> {
    return this.api.post('/taxa',
      {
        query: {
          page: 1,
          pageSize: 1000,
          selectedFields: 'id,taxonomicOrder'
        }
      },
      {
        taxonSets: [
          'MX.taxonSetArchipelagoWaterbirds', 'MX.taxonSetArchipelagoWaders', 'MX.taxonSetArchipelagoGulls',
          'MX.taxonSetArchipelagoPasserines', 'MX.taxonSetArchipelagoAlcids', 'MX.taxonSetArchipelagoRaptors',
          'MX.taxonSetArchipelagoCormorants', 'MX.taxonSetArchipelagoEgrets', 'MX.taxonSetArchipelagoMammals'
        ]
      }
    ).pipe(
      map(res => res.results)
    );
  }

  getRowItems$(year: string, namedPlaceId: string): Observable<RowItem[]> {
    this.loading$.next(true);
    return forkJoin([
      this.api.get('/documents', {
        query: {
          page: 1,
          pageSize: 1000,
          collectionID: 'HR.6920',
          observationYear: Number(year),
          namedPlace: namedPlaceId,
          selfAsEditorOrCreator: true,
          selectedFields: 'gatheringEvent.dateBegin,gatherings.units,gatherings.gatheringType'
        }
      }),
      this.taxonomicOrder$
    ]).pipe(
      map(([res, taxa]) => {
        const orderMap = new Map(taxa.map(t => [t.id, t.taxonomicOrder]));
        return { docs: res.results, orderMap };
      }),
      map(({ docs, orderMap }) => ({
        units: docs.flatMap(doc =>
          (doc.gatherings ?? []).flatMap(g =>
            (g.units ?? []).map(unit => ({ ...unit, dateBegin: doc.gatheringEvent?.dateBegin, gatheringType: g.gatheringType }))
          )
        ),
        orderMap
      })),
      map(({ units, orderMap }) => ({
        units: units.filter(unit =>
          unit.observationStatus === 'MY.observationStatusObservedNoCount'
          || unit.observationStatus === 'MY.observationStatusObservedPartialCount'
          || unit.observationStatus === 'MY.observationStatusObservedCompleteCount'
        ),
        orderMap
      })),
      map(({ units, orderMap }) => ({
        units: units.map(unit => {
          const ad = (unit.unitFact?.adultIndividualCount ?? 0) + ' ad';
          const m = (unit.maleIndividualCount ?? '');
          const f = (unit.femaleIndividualCount ?? '');
          const ratio = (m || f) ? `${m}/${f}` : '0/0';
          const juv = (unit.unitFact?.juvenileIndividualCount ?? 0) + ' juv';
          const pull = (unit.unitFact?.pullusIndividualCount ?? 0) + ' pull';
          const brood = (unit.unitFact?.broodCount ?? 0) + ' poikue';
          const nest = (unit.nestCount ?? 0) + ' pesä';
          const dNest = (unit.unitFact?.destroyedNestCount ?? 0) + ' tuhot.';
          return {
            ...unit,
            observations: [ad, ratio, juv, pull, brood, nest, dNest].join(', ')
          };
        }),
        orderMap
      })),
      map(({ units, orderMap }) => {
        const sorted = [...units].sort((a, b) => {
          const orderA = orderMap.get(a.identifications?.[0]?.taxonID ?? '') ?? Infinity;
          const orderB = orderMap.get(b.identifications?.[0]?.taxonID ?? '') ?? Infinity;
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          return (a.dateBegin ?? '').localeCompare(b.dateBegin ?? '');
        });
        return sorted;
      }),
      map(units => units.map(unit => {
        const icon = unit.gatheringType === 'MY.gatheringTypeNestCount' ? ' \u{1F6B6}'
          : unit.gatheringType === 'MY.gatheringTypeBoatCount' ? ' \u{1F6A3}'
          : '';
        return {
          taxonVerbatim: unit.identifications[0].taxonVerbatim,
          dateBegin: (unit.dateBegin ?? '') + icon,
          observations: unit.observations,
          notes: unit.notes ?? ''
        };
      })),
      map(rows => rows.map((row, i) => ({
        ...row,
        taxonVerbatim: i > 0 && row.taxonVerbatim === rows[i - 1].taxonVerbatim ? '' : row.taxonVerbatim
      }))),
      tap(() => this.loading$.next(false))
    );
  }
};
