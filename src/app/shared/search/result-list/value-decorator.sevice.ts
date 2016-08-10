export class ValueDecoratorService {

  private lang = 'fi';

  private decoratable = {
    'document.documentId':'makeId',
    'gathering.eventDate':'makeDateRange',
    'gathering.team': 'makeArrayToBr',
    'unit.linkings.taxon': 'makeTaxon'
  };

  public isDecoratable(field:string) {
    return typeof this.decoratable[field] !== "undefined";
  }

  public decorate(field:string, value:any, context:any) {
    if (!this.isDecoratable(field)) {
      return value;
    }
    return this[this.decoratable[field]](value, context);
  }

  protected makeDateRange(value) {
    if (value.begin !== value.end) {
      return `${value.begin} - ${value.end}`
    }
    return `${value.begin}`
  }

  protected makeId(value) {
    return `<a href="${value}">link</a>`
  }

  protected makeArrayToBr(value) {
    return value.join('<br>')
  }

  protected makeTaxon(value) {
    if (typeof value.vernacularName[this.lang] !== "undefined") {
      return `${value.scientificName} (${value.vernacularName[this.lang]})`;
    }
    return `${value.scientificName}`;
  }
}
