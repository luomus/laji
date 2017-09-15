import { Component, Input, OnInit } from '@angular/core';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';

@Component({
  selector: 'laji-aggregated-datatable',
  templateUrl: './aggregated-datatable.component.html',
  styleUrls: ['./aggregated-datatable.component.css']
})
export class AggregatedDatatableComponent implements OnInit {

  @Input() query: WarehouseQueryInterface;

  rows = [
    {
      name: 'Claudine Neal',
      gender: 'female',
      company: 'Sealoud'
    },
    {
      name: 'Beryl Rice',
      gender: 'female',
      company: 'Velity'
    },
    {
      name: 'Beryl Rice',
      gender: 'female',
      company: 'Velity'
    },
    {
      name: 'Beryl Rice',
      gender: 'female',
      company: 'Velity'
    },
    {
      name: 'Beryl Rice',
      gender: 'female',
      company: 'Velity'
    },
    {
      name: 'Beryl Rice',
      gender: 'female',
      company: 'Velity'
    },
    {
      name: 'Beryl Rice',
      gender: 'female',
      company: 'Velity'
    },
    {
      name: 'Beryl Rice',
      gender: 'female',
      company: 'Velity'
    },
    {
      name: 'Beryl Rice',
      gender: 'female',
      company: 'Velity'
    },
    {
      name: 'Beryl Rice',
      gender: 'female',
      company: 'Velity'
    },
    {
      name: 'Beryl Rice',
      gender: 'female',
      company: 'Velity'
    },
    {
      name: 'Beryl Rice',
      gender: 'female',
      company: 'Velity'
    },
    {
      name: 'Beryl Rice',
      gender: 'female',
      company: 'Velity'
    },
    {
      name: 'Beryl Rice',
      gender: 'female',
      company: 'Velity'
    },
    {
      name: 'Beryl Rice',
      gender: 'female',
      company: 'Velity'
    },
    {
      name: 'Beryl Rice',
      gender: 'female',
      company: 'Velity'
    },
    {
      name: 'Beryl Rice',
      gender: 'female',
      company: 'Velity'
    }
  ];

  columns = [
    { name: 'Name' },
    { name: 'Gender' },
    { name: 'Company' }
  ];

  allColumns = [
    { name: 'Name' },
    { name: 'Gender' },
    { name: 'Company' }
  ];

  constructor() { }

  ngOnInit() {
  }

  isChecked(col) {
    return this.columns.find(c => {
      return c.name === col.name;
    });
  }

}
