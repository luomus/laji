import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'laji-sample',
  templateUrl: './sample.component.html',
  styleUrls: ['./sample.component.scss']
})
export class SampleComponent implements OnInit {

  private _sample: any;
  @Input() showFacts = false;
  @Input() highlight: string;
  pickFacts = [
    'http://tun.fi/MF.preparationType',
    'http://tun.fi/MF.material',
    'http://tun.fi/MF.preparationMaterials',
    'http://tun.fi/MF.collectionID'
  ];
  facts = {};

  constructor() { }

  ngOnInit() {
  }

  @Input() set sample(sample: any) {
    this._sample = sample;
    const facts = {};
    if (sample && Array.isArray(sample.facts)) {
      sample.facts.forEach(fact => {
        if (this.pickFacts.includes(fact.fact)) {
          if (!facts[fact.fact]) {
            facts[fact.fact] = [];
          }
          facts[fact.fact].push(fact.value);
        }
      });
    }
    this.facts = facts;
  }

  get sample() {
    return this._sample;
  }

}
