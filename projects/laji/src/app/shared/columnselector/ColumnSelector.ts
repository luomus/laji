
export class ColumnSelector {
  private selectedFields: string[] = [];
  private requiredFields: string[] = [];
  private changedByEdit = false;

  get columns() {
    return this.selectedFields;
  }

  set columns(columns: string[]) {
    const selected = [...columns];
    if (this.requiredFields.length) {
      this.requiredFields.forEach(r => {
        if (!selected.includes(r)) {
          selected.push(r);
        }
      });
    }
    this.selectedFields = selected;
    this.changedByEdit = false;
  }

  get required() {
    return this.requiredFields;
  }

  set required(required: string[]) {
    this.requiredFields = [...required];
    if (this.selectedFields?.length && required?.length) {
      this.columns = this.selectedFields;
    }
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
    this.selectedFields = [...this.requiredFields];
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

  moveFieldByName(field: string, direction: number) {
    const idx = this.selectedFields.indexOf(field);
    const idxmoved = idx + direction;

    if (idx === -1 || idxmoved < 0 || idxmoved >= this.selectedFields.length) {
      return;
    }

    this.moveFieldByIndex(idx, idxmoved);
  }
}
