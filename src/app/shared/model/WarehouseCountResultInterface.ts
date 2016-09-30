/**
 * Count query interface for warehouse
 *
 * @property total count results.
 * @property totalMaximumForList how many items can be shown as a list.
 */
export interface WarehouseCountResultInterface {
  total?: number;
  totalMaximumForList?: string;
}
