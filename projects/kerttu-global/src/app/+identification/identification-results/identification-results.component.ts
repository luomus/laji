import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'bsg-identification-results',
  templateUrl: './identification-results.component.html',
  styleUrls: ['./identification-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationResultsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
