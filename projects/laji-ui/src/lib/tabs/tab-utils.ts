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
    return Object.keys(this.loaded)[i];
  }

  getIdxFromName(s: string): number {
    return Object.keys(this.loaded).findIndex(name => name === s);
  }

  isLoaded(i: number | string): boolean {
    if (typeof i === 'number') {
      return this.loaded[Object.keys(this.loaded)[i]];
    } else {
      return this.loaded[i];
    }
  }

  load(i: number | string) {
    if (typeof i === 'number') {
      this.loaded[Object.keys(this.loaded)[i]] = true;
    } else {
      this.loaded[i] = true;
    }
  }

  reset() {
    this.names.forEach((name) => this.loaded[name] = false);
  }
}
