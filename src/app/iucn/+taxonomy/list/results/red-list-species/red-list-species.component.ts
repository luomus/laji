import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'laji-red-list-species',
  templateUrl: './red-list-species.component.html',
  styleUrls: ['./red-list-species.component.scss']
})
export class RedListSpeciesComponent implements OnInit {

  // @Input()
  species = [
    {vernacularName: 'mustakotilokuoriainen', scientificName: 'Drilus concolor', status: 'VU', critery: 'D2'},
    {vernacularName: 'kijokonnakas', scientificName: 'Epuraea gutata', status: 'NT', critery: 'R2'},
    {vernacularName: 'mustakotilokuoriainen', scientificName: 'Drilus concolor', status: 'VU', critery: 'D2'},
    {vernacularName: 'kijokonnakas', scientificName: 'Epuraea gutata', status: 'NT', critery: 'R2'},
    {vernacularName: 'mustakotilokuoriainen', scientificName: 'Drilus concolor', status: 'VU', critery: 'D2'},
    {vernacularName: 'kijokonnakas', scientificName: 'Epuraea gutata', status: 'NT', critery: 'R2'},
    {vernacularName: 'mustakotilokuoriainen', scientificName: 'Drilus concolor', status: 'VU', critery: 'D2'}
  ];

  constructor() { }

  ngOnInit() {
  }

}
