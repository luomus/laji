function toElement<T>(elem: any, elemType: any): T {
  if (elem instanceof elemType) {
    return elem;
  }
  throw new Error(`Element is not ${elemType}`);
}

export function toHtmlSelectElement(elem: unknown): HTMLSelectElement {
  return toElement(elem, HTMLSelectElement);
}

export function toHtmlInputElement(elem: unknown): HTMLInputElement {
  return toElement(elem, HTMLInputElement);
}

export function toHtmlSpanElement(elem: unknown): HTMLSpanElement {
  return toElement(elem, HTMLSpanElement);
}

