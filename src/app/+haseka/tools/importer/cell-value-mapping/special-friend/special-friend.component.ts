import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormField, IGNORE_VALUE} from '../../../model/form-field';
import {FriendService} from '../../../../../shared/service/friend.service';

@Component({
  selector: 'laji-special-friend',
  templateUrl: './special-friend.component.html',
  styleUrls: ['./special-friend.component.css']
})
export class SpecialFriendComponent implements OnInit {

  @Input() invalidValues: string[];
  @Input() mapping: {[value: string]: any} = {};
  @Input() field: FormField;
  @Output() mappingChanged = new EventEmitter<{[value: string]: string}>();
  validValues = [];
  validIds = [];
  valueAsIs = 'Arvo sellaisenaan';

  constructor(private friendsService: FriendService) {}

  ngOnInit() {
    const validIds = ['', ''];
    const validValues = [this.valueAsIs, IGNORE_VALUE];
    this.friendsService.allFriends()
      .subscribe((friends) => {
        friends.forEach(friend => {
          validValues.push(friend.value);
          validIds.push(friend.key);
        });
        this.validIds = validIds;
        this.validValues = validValues;
      })
  }

  valueMapped(value, to) {
    const mapping = {...this.mapping};

    if (to === IGNORE_VALUE) {
      mapping[value] = to;
    } else if (to === this.valueAsIs) {
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
