import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'laji-named-place-wrapper',
  templateUrl: './named-place-wrapper.component.html',
  styleUrls: ['./named-place-wrapper.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NamedPlaceWrapperComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
