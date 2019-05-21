
export class ColumnSelector {
  private selectedFields: string[] = [];
  private changedByEdit = false;

  constructor() { }

  get columns() {
    return this.selectedFields;
  }

  set columns(columns: string[]) {
    this.selectedFields = columns;
    this.changedByEdit = false;
  }

  get hasChanges(): boolean {
    return this.changedByEdit;
  }

  // trigger angular change detection
  private updateSelectedFields() {
    this.selectedFields = [...this.selectedFields];
    this.changedByEdit  = true;
  }

  clear() {
    this.selectedFields = [];
    this.changedByEdit = true;
  }

  hasField(field: string): boolean {
    return this.selectedFields.indexOf(field) !== -1;
  }

  toggleSelectedField(field: string) {
    const idx = this.selectedFields.indexOf(field);

    if (idx === -1) {
      this.selectedFields.push(field);
    } else {
       this.selectedFields.splice(idx, 1);
    }

    this.updateSelectedFields();
  }

  moveFieldByIndex(from: number, to: number) {
    const movedField = this.selectedFields.splice(from, 1)[0];
    this.selectedFields.splice(to, 0, movedField);

    this.updateSelectedFields();
  }

  moveFieldByName(field: string, direction: number): boolean {
    const idx = this.selectedFields.indexOf(field);
    const idxmoved = idx + direction;

    if (idx === -1 || idxmoved < 0 || idxmoved >= this.selectedFields.length) {
      return;
    }

    this.moveFieldByIndex(idx, idxmoved);
  }
}
