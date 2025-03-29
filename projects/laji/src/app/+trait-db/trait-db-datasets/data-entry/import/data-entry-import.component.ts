import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'laji-trait-db-data-entry-import',
  templateUrl: './data-entry-import.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TraitDbDataEntryImportComponent {
  @Output() traitDataTsv = new EventEmitter<string | null>();

  @ViewChild('fileSelector') fileSelector: ElementRef<HTMLInputElement> | undefined;

  data: string | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  onFileChange(event: Event) {
    const target = event.target as HTMLInputElement;

    if (target.files!.length !== 1) {
      return;
    }

    const file = target.files![0];
    file.text().then(str => {
      this.data = str ?? null;
      this.cdr.markForCheck();
    });
  }

  onRemoveFile() {
    if (this.fileSelector) {
      this.data = null;
      this.fileSelector.nativeElement.value = '';
    }
  }

  onTextAreaInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.data = target.value ?? null;
  }

  onSubmit() {
    this.traitDataTsv.emit(this.data);
  }

  isFileAttached() {
    return (this.fileSelector?.nativeElement.files?.length ?? -1) > 0;
  }
}

