import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'laji-quality-row',
  templateUrl: './quality-row.component.html',
  styleUrls: ['./quality-row.component.scss']
})
export class QualityRowComponent implements OnInit {
  @Input() quality: string;
  @Input() qualityIcon: string;

  constructor() { }

  ngOnInit() { }
}
