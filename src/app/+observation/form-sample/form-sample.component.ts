import { Component } from '@angular/core';
import { ObservationFormComponent } from '../form/observation-form.component';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { ObservationFormQuery } from '../form/observation-form-query.interface';
import { IdService } from '../../shared/service/id.service';

@Component({
  selector: 'laji-form-sample',
  templateUrl: './form-sample.component.html',
  styleUrls: ['../form/observation-form.component.scss']
})
export class FormSampleComponent extends ObservationFormComponent {

  facts: any = {
    'MY.DNAVolumeMicroliters': {min: '', max: ''},
    'MY.DNARatioOfAbsorbance260And280': {min: '', max: ''},
    'MY.DNAConcentrationNgPerMicroliter': {min: '', max: ''},
  };

  onFormQueryChange() {
    super.onFormQueryChange();
  }

  searchQueryToFormQuery(query: WarehouseQueryInterface): ObservationFormQuery {
    this.parseFacts(query.sampleFact);
    return super.searchQueryToFormQuery(query);
  }

  onTaxonSelect(event) {
    if ((event.key === 'Enter' || (event.value && event.item)) && this.formQuery.taxon) {
      const taxon = this.formQuery.taxon.endsWith('*') ? this.formQuery.taxon : this.formQuery.taxon + '*';
      this.query['target'] = this.query['target'] ?
        [...this.query['target'], taxon] : [taxon];
      this.formQuery.taxon = '';
      this.onQueryChange();
    }
  }

  parseFacts(facts: string|string[]) {
    if (Array.isArray(facts)) {
      facts.forEach(fact => this.parseFacts(fact));
    }
    if (typeof facts === 'string') {
      const parts = facts.split(',');
      parts.filter(val => !!val).forEach(fact => this.parseFact(fact));
    }
  }

  parseFact(fact: string) {
    const parts = fact.split('=');
    const key = IdService.getId(parts.shift());
    const values = (parts[0] || '').split('/');
    if (key && values.length > 0) {
      this.facts[key] = {
        min: values[0],
        max: values[1] || '',
      };
    }
  }

  onFactsChange(factKey: keyof Pick<WarehouseQueryInterface, 'documentFact' | 'gatheringFact' | 'unitFact' | 'sampleFact'> = 'sampleFact') {
    const facts: string[] = [];
    Object.keys(this.facts).forEach(fact => {
      if (this.facts[fact].min || this.facts[fact].max) {
        facts.push(`${IdService.getUri(fact)}=${this.facts[fact].min || ''}/${this.facts[fact].max || ''}`);
      }
    });
    this.query[factKey] = facts;
    super.onQueryChange();
  }
}
