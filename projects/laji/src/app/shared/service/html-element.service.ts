function error(type: string) {
  throw new Error(`Element is not ${type}`);
}

function toElement<T>(elem, elemType: any, elemText: string): T {
  if (elem instanceof elemType) {
    return elem;
  }
  error(elemText);
}

export function toHtmlSelectElement(elem: unknown): HTMLSelectElement {
  return toElement(elem, HTMLSelectElement, 'HTMLSelectElement');
}

export function toHtmlInputElement(elem: unknown): HTMLInputElement {
  return toElement(elem, HTMLInputElement, 'HTMLInputElement');
}

export function toHtmlSpanElement(elem: unknown): HTMLSpanElement {
  return toElement(elem, HTMLSpanElement, 'HTMLSpanElement');
}

