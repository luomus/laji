import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MetadataService } from '../../../shared/service/metadata.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-three-state-multi-switch',
  templateUrl: './three-state-multi-switch.component.html',
  styleUrls: ['./three-state-multi-switch.component.css']
})
export class ThreeStateMultiSwitchComponent implements OnInit {

  @Input() title;
  @Input() info;
  @Input() trueValue: string[];
  @Input() falseValue: string[];

  @Output() update = new EventEmitter<{true: string[], false: string[]}>();


  lang: string;
  options$: Observable<any>;
  open = false;
  hasSelectedOptions = false;

  constructor(
    private metadataService: MetadataService,
    private translate: TranslateService) { }

  ngOnInit() {
    this.lang = this.translate.currentLang;
    this.hasSelectedOptions = this.trueValue?.length > 0 || this.falseValue?.length > 0 ? true : false;
  }

  @Input()
  set alt(alt: string) {
    this.options$ = this.metadataService.getRange(alt).pipe(
      map(range => range.map(options => ({id: options.id, value: options.label})))
    );
  }

  changeValue(event) {
    const trueValues = (this.trueValue || []).filter(item => item !== event.id);
    const falseValues = (this.falseValue || []).filter(item => item !== event.id);
    if (event.value === true) {
      trueValues.push(event.id);
    } else if (event.value === false) {
      falseValues.push(event.id);
    }

    this.hasSelectedOptions = trueValues.length > 0 || falseValues.length > 0 ? true : false;
    this.update.emit({true: trueValues, false: falseValues});
  }

  toggle(event) {
    if (event.target.classList.contains('no-propagation')) {
      return;
    }
    this.open = !this.open;
  }

}
