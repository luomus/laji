import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { WarehouseValueMappingService } from '../service/warehouse-value-mapping.service';

@Pipe({
  name: 'warehouse',
  pure: false
})
export class WarehousePipe implements PipeTransform {

  value = '';

  constructor(
    private warehouseService: WarehouseValueMappingService,
    private cdr: ChangeDetectorRef
  ) {}

  transform(value: string): string {
    this.warehouseService.getOriginalKey(value).subscribe((v) => {
        this.value = v;
        this.cdr.markForCheck();
    });

    return this.value;
  }

}
