export function toHtmlSelectElement(elem: unknown): HTMLSelectElement {
  if (elem instanceof HTMLSelectElement) {
    return elem;
  }
  throw new Error('Element is not HTMLSelectElement');
}
