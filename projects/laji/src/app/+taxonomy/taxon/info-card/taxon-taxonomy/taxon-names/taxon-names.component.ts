import { ChangeDetectionStrategy, Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Taxonomy } from '../../../../../shared/model/Taxonomy';
import { UserService } from '../../../../../shared/service/user.service';
import { Person } from '../../../../../shared/model/Person';
import { Subscription } from 'rxjs';

@Component({
  selector: 'laji-taxon-names',
  templateUrl: './taxon-names.component.html',
  styleUrls: ['./taxon-names.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonNamesComponent implements OnInit, OnDestroy {
  _taxon: Taxonomy;
  availableLangs = {'vernacularName': [], 'alternativeVernacularName': [], 'obsoleteVernacularName': [], 'colloquialVernacularName': [], 'tradeName': []};
  synonymTypes = [
    'basionyms',
    'objectiveSynonyms',
    'subjectiveSynonyms',
    'homotypicSynonyms',
    'heterotypicSynonyms',
    'synonyms',
    'misspelledNames',
    'orthographicVariants',
    'uncertainSynonyms',
    'misappliedNames',
    'alternativeNames'
  ];
  personRoleAdmin = false;
  subscribePerson: Subscription;

  @Input() set taxon(taxon: Taxonomy) {
    this.subscribePerson = this.userService.user$.subscribe((person: Person) => {
      this.personRoleAdmin = UserService.isIctAdmin(person);
      this.availableLangs = {'vernacularName': [], 'alternativeVernacularName': [], 'obsoleteVernacularName': [], 'colloquialVernacularName': [], 'tradeName': []};
      for (const lang of ['fi', 'sv', 'en', 'se', 'ru']) {
        if (taxon.vernacularName && taxon.vernacularName[lang]) {
          this.availableLangs.vernacularName.push(lang);
        }
        if (taxon.alternativeVernacularName && taxon.alternativeVernacularName[lang]) {
          this.availableLangs.alternativeVernacularName.push(lang);
        }
        if (taxon.obsoleteVernacularName && taxon.obsoleteVernacularName[lang]) {
          this.availableLangs.obsoleteVernacularName.push(lang);
        }
        if (taxon.tradeName && taxon.tradeName[lang]) {
          this.availableLangs.tradeName.push(lang);
        }
        if (taxon.colloquialVernacularName && taxon.colloquialVernacularName[lang] && this.personRoleAdmin) {
          this.availableLangs.colloquialVernacularName.push(lang);
        }
      }
    });


    this._taxon = taxon;
  }

  constructor(
    private userService: UserService
  ) { }

  ngOnInit() {}

  ngOnDestroy() {
    if (this.subscribePerson) {
      this.subscribePerson.unsubscribe();
    }
  }

  taxonHasSynonymKey(taxon) {
    for (let i = 0; i < this.synonymTypes.length; i++) {
      if (taxon.hasOwnProperty(this.synonymTypes[i])) {
        return true;
      }
    }
    return false;
  }

  hasOtherNamesBefore(array) {
    for (let i = 0; i < array.length; i++) {
      if (this.availableLangs[array[i]].length > 0) {
        return true;
      }
    }

    return false;
  }

}
