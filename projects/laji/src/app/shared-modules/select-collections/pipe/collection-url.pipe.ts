import { Pipe, PipeTransform } from '@angular/core';
import { IdService } from '../../../shared/service/id.service';

@Pipe({
  name: 'collectionUrl'
})
export class CollectionUrlPipe implements PipeTransform {

  transform(value: any): any {
    return IdService.getUri(value);
  }

}
