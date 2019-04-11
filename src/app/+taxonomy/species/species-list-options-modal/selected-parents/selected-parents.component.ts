import {Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'laji-selected-parents',
  templateUrl: './selected-parents.component.html',
  styleUrls: ['./selected-parents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectedParentsComponent implements OnInit {
  @Input() header: string;
  @Input() parents: string[] = [];
  @Input() selected: string[] = [];
  @Output() toggle = new EventEmitter<string[]>();

  constructor() { }

  ngOnInit() {
  }

  onToggle(parent: string) {
    this.toggle.emit(['parent.' + parent + '.scientificName', 'parent.' + parent + '.scientificNameAuthorship']);
  }
}
