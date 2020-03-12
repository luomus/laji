import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {map, switchMap, take} from 'rxjs/operators';
import {forkJoin, Observable, of} from 'rxjs';
import {Taxonomy} from '../../../shared/model/Taxonomy';
import {KerttuApi} from '../kerttu-api';
import {UserService} from '../../../shared/service/user.service';
import {PersonApi} from '../../../shared/api/PersonApi';
import {TaxonomyApi} from '../../../shared/api/TaxonomyApi';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'laji-kerttu-taxon-select',
  templateUrl: './kerttu-taxon-select.component.html',
  styleUrls: ['./kerttu-taxon-select.component.scss']
})
export class KerttuTaxonSelectComponent implements OnInit {
  @Input() taxonExpertise: string[];
  taxonList$: Observable<Taxonomy[]>;
  currentTaxon: string;

  @Output() taxonChange = new EventEmitter<string>();

  constructor(
    private kerttuApi: KerttuApi,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private personService: PersonApi,
    private taxonomyApi: TaxonomyApi,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.userService.isLoggedIn$.pipe(take(1)).subscribe(() => {
      this.taxonList$ = this.kerttuApi.getLetterCandidateTaxonList(this.userService.getToken()).pipe(
        map((taxonList: string[]) => {
          const taxonExpertise =  this.taxonExpertise || [];
          return taxonList.filter(id => taxonExpertise.indexOf(id) > -1);
        }),
        switchMap((taxonList: string[]) => taxonList.length > 0 ? forkJoin(
          taxonList.map(
            id => this.taxonomyApi.taxonomyFindBySubject(id, this.translate.currentLang, {'selectedFields': 'id,scientificName,vernacularName,cursiveName'})
          )
        ) : of([]))
      );
    });
  }

  onTaxonChange(id: string) {
    this.currentTaxon = id;
    this.taxonChange.emit(id);
  }
}
