import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'laji-red-list-species',
  templateUrl: './red-list-species.component.html',
  styleUrls: ['./red-list-species.component.scss']
})
export class RedListSpeciesComponent implements OnInit {

  // @Input()
  species = [
    {vernacularName: 'mustakotilokuoriainen', scientificName: 'Drilus concolor', status: 'VU', critery: 'D2', note: 'Peter Piper picked a peck of pickled peppers.'},
    {vernacularName: 'kijokonnakas', scientificName: 'Epuraea gutata', status: 'NT', critery: 'R2', note: 'A peck of pickled peppers Peter Piper picked.'},
    {vernacularName: 'mustakotilokuoriainen', scientificName: 'Drilus concolor', status: 'VU', critery: 'D2', note: 'If Peter Piper picked a peck of pickled peppers,'},
    {vernacularName: 'kijokonnakas', scientificName: 'Epuraea gutata', status: 'NT', critery: 'R2', note: 'Where\'s the peck of pickled peppers Peter Piper picked?'},
    {vernacularName: 'mustakotilokuoriainen', scientificName: 'Drilus concolor', status: 'VU', critery: 'D2', note: ''},
    {vernacularName: 'kijokonnakas', scientificName: 'Epuraea gutata', status: 'NT', critery: 'R2', note: 'foobar'},
    {vernacularName: 'mustakotilokuoriainen', scientificName: 'Drilus concolor', status: 'VU', critery: 'D2'}
  ];

  constructor() { }

  ngOnInit() {
  }

}
