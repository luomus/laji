/**
 * Count query interface for warehouse
 */
export interface WarehouseCountResultInterface {
  /**
   * @var total count results.
   */
  total?: number;
  /**
   * @var totalMaximumForList how many items can be shown as a list.
   */
  totalMaximumForList?: string;
}
