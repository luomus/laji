import { Pipe, PipeTransform } from '@angular/core';
import { FormService } from '../../shared/service/form.service';
import { Form } from '../../shared/model/Form';

@Pipe({
  name: 'formHasFeature'
})
export class FormHasFeaturePipe implements PipeTransform {

  transform(value: Form.List, feature: Form.Feature | string): boolean {
    return FormService.hasFeature(value, feature as Form.Feature);
  }

}
