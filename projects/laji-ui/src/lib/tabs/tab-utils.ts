/**
 * Can be used to store which tabs have been loaded.
 * This is useful, because we might want to prevent content from loading before the tab is selected.
 *
 *  lu-tabs onSelect="loadedElementsStore.load($event)"
 *    tab heading="example1"
 *      *ngIf="loadedElementsStore.isLoaded('example1')"
 *        -- tab content --
 */
export class LoadedElementsStore {
  private loaded = {};

  constructor (private names: string[]) {
    this.reset();
  }

  getNameFromIdx(i: number): string {
    return this.names[i];
  }

  getIdxFromName(s: string): number {
    console.log(this.names.findIndex(name => name === s))
    return this.names.findIndex(name => name === s);
  }

  isLoaded(i: number | string): boolean {
    return this.loaded[this.getName(i)];
  }

  load(i: number | string) {
    this.loaded[this.getName(i)] = true;
  }

  reset() {
    this.names.forEach((name) => this.loaded[name] = false);
  }

  private getName(i: number | string): string {
    return typeof i === 'number' ? this.getNameFromIdx(i) : i;
  }
}
