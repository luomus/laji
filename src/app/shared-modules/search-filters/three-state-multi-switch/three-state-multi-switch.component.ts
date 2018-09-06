import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MetadataService } from '../../../shared/service/metadata.service';
import { map } from 'rxjs/operators';
import { MultiLangService } from '../../../shared-modules/lang/service/multi-lang.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'laji-three-state-multi-switch',
  templateUrl: './three-state-multi-switch.component.html',
  styleUrls: ['./three-state-multi-switch.component.css']
})
export class ThreeStateMultiSwitchComponent implements OnInit {

  @Input() title;
  @Input() info;
  @Input() lang: string;
  @Input() trueValue: string[];
  @Input() falseValue: string[];

  @Output() update = new EventEmitter<{true: string[], false: string[]}>();


  options$: Observable<any>;
  open = false;

  constructor(private metadataService: MetadataService) { }

  ngOnInit() {
  }

  @Input()
  set alt(alt: string) {
    this.options$ = this.metadataService.getRange(alt).pipe(
      map(range => range.map(options => ({id: options.id, value: MultiLangService.getValue(options.value, this.lang)})))
    )
  }

  changeValue(event) {
    const trueValues = (this.trueValue || []).filter(item => item !== event.id);
    const falseValues = (this.falseValue || []).filter(item => item !== event.id);
    if (event.value === true) {
      trueValues.push(event.id);
    } else if (event.value === false) {
      falseValues.push(event.id);
    }
    this.update.emit({true: trueValues, false: falseValues});
  }

  toggle(event) {
    if (event.target.classList.contains('no-propagation')) {
      return;
    }
    this.open = !this.open;
  }

}
