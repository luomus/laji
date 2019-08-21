import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { UserService } from '../service/user.service';
import { Person } from '../model/Person';

/**
 * Return users data from strings
 * Takes the users id and return other representations of it.
 * Usage:
 *   value | users:<format>
 * Example:
 *   'MA.97' | users:'name'
 */
@Pipe({
  name: 'users',
  pure: false
})
export class UsersPipe implements PipeTransform {
  value = '';
  lastId: string;
  lastFormat: string;

  constructor(private userService: UserService,
              private _ref: ChangeDetectorRef) {
  }

  transform(value: string, format: keyof Person | 'fullNameWithGroup'): any {
    if (!value || value.length === 0) {
      return value;
    }
    // if we ask another time for the same key, return the last value
    if (value === this.lastId && format === this.lastFormat) {
      return this.value;
    }
    // store the id and format, in case they change
    this.lastId = value;
    this.lastFormat = format;

    // set the value
    this.updateValue(value, format);

    return this.value;
  }

  private updateValue(id: string, format: keyof Person | 'fullNameWithGroup'): void {
    this.userService.getPersonInfo(id, format)
      .subscribe(
        (name: string) => {
          this.value = name;
          this._ref.markForCheck();
        }
      );
  }
}
