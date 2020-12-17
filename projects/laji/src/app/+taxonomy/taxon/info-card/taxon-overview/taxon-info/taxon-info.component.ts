import { ChangeDetectionStrategy, Component, Input, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Taxonomy } from '../../../../../shared/model/Taxonomy';
import { UserService } from '../../../../../shared/service/user.service';
import { Person } from '../../../../../shared/model/Person';

@Component({
  selector: 'laji-taxon-info',
  templateUrl: './taxon-info.component.html',
  styleUrls: ['./taxon-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonInfoComponent implements OnInit, OnDestroy {

  @Input() taxon: Taxonomy;

  langs = ['fi', 'sv', 'en', 'se', 'ru'];
  availableVernacularNames = [];
  availableTaxonNames = {vernacularNames: [], colloquialVernacularNames: []};
  personRoleAdmin = false;
  subscribePerson: Subscription;

  constructor(
    public translate: TranslateService,
    private userService: UserService
    ) { }

  ngOnInit() {
    this.subscribePerson = this.userService.user$.subscribe((person: Person) => {
      this.personRoleAdmin = UserService.isIctAdmin(person);
      this.initLangTaxonNames();
    });
  }

  ngOnDestroy() {
    if (this.subscribePerson) {
      this.subscribePerson.unsubscribe();
    }
  }

  initLangTaxonNames() {
   this.langs.forEach(value => {
    if (this.taxon.vernacularName?.hasOwnProperty(value) && this.taxon.vernacularName[value] !== '') {
      this.availableVernacularNames.push({'lang': value});
      this.availableTaxonNames.vernacularNames.push({'lang': value});
    }
    if (this.taxon.colloquialVernacularName?.hasOwnProperty(value) && this.taxon.colloquialVernacularName[value] !== '') {
      this.availableTaxonNames.colloquialVernacularNames.push({'lang': value});
    }
   });

  }
}
