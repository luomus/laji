import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { FormField, VALUE_IGNORE, VALUE_AS_IS } from '../../../model/form-field';
import {FriendService} from '../../../../../shared/service/friend.service';

@Component({
  selector: 'laji-special-friend',
  templateUrl: './special-friend.component.html',
  styleUrls: ['./special-friend.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpecialFriendComponent implements OnInit {

  @Input() invalidValues: string[];
  _field: FormField;
  @Output() mappingChanged = new EventEmitter<{[value: string]: string}>();
  _mapping: {[value: string]: any};
  validValues = [];
  validIds = [];
  currentValues;

  constructor(
    private friendsService: FriendService,
    private cdr: ChangeDetectorRef
  ) {}

  @Input()
  set field(field: FormField) {
    this._field = field;
    this.initCurrentValue();
  }

  @Input()
  set mapping(mapping: {[value: string]: any}) {
    this._mapping = mapping;
    this.initCurrentValue();
  }

  ngOnInit() {
    const validIds = ['', ''];
    const validValues = [VALUE_AS_IS, VALUE_IGNORE];
    this.friendsService.allFriends()
      .subscribe((friends) => {
        friends.forEach(friend => {
          validValues.push(friend.value);
          validIds.push(friend.key);
        });
        this.validIds = validIds;
        this.validValues = validValues;
        this.initCurrentValue();
      })
  }

  initCurrentValue() {
    if (!this._mapping || !this.validValues || this.validValues.length === 0) {
      return;
    }

    let hasMapping = false;
    const values = {};
    const mapping = {...this._mapping};
    this.invalidValues.forEach(value => {
      const idx = this.validValues.indexOf(value);
      const keyIdx = this.validIds.indexOf(this._mapping[value]);
      if (mapping[value] && keyIdx > -1) {
        hasMapping = true;
        values[value] = this.validValues[keyIdx];
      } else if (mapping[value]) {
        hasMapping = true;
        values[value] = mapping[value];
      } else if (idx > -1) {
        hasMapping = true;
        values[value] = value;
        mapping[value] = this.validIds[idx];
      }
    });
    if (hasMapping) {
      this.currentValues = values;
      this.mappingChanged.emit(mapping);
    }
    this.cdr.markForCheck();
  }

  valueMapped(value, to) {
    const mapping = {...this._mapping};

    if (to === VALUE_IGNORE) {
      mapping[value] = to;
    } else if (to === VALUE_AS_IS) {
      mapping[value] = value;
    } else if (typeof to !== 'undefined') {
      const idx = this.validValues.indexOf(to);
      if (idx > -1) {
        mapping[value] = this.validIds[idx];
      }
    }
    this.mappingChanged.emit(mapping);
  }

}
