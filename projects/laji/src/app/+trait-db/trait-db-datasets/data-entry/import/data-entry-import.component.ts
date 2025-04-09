import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

const headerReferenceCmsIds = { fi: '0', sv: '0', en: '0' };

@Component({
  selector: 'laji-trait-db-data-entry-import',
  templateUrl: './data-entry-import.component.html',
  styleUrls: ['./data-entry-import.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TraitDbDataEntryImportComponent {
  @Output() traitDataTsv = new EventEmitter<string | null>();

  @ViewChild('fileSelector') fileSelector: ElementRef<HTMLInputElement> | undefined;
  @ViewChild('textArea') textArea: ElementRef<HTMLTextAreaElement> | undefined;

  data: string | null = null;
  headerReferenceContent$ = this.translate.onLangChange.pipe(
    startWith({lang: this.translate.currentLang}),
    map(event => headerReferenceCmsIds[event.lang as 'fi' | 'sv' | 'en']),
    switchMap(cmsId => of({ content: 'todo create cms page ' + cmsId }))
  );

  constructor(private cdr: ChangeDetectorRef, private translate: TranslateService) {}

  onFileChange(event: Event) {
    const target = event.target as HTMLInputElement;

    if (target.files!.length !== 1) {
      return;
    }

    const file = target.files![0];
    file.text().then(str => {
      this.data = str ?? null;
      this.textArea!.nativeElement.value = str;
      this.cdr.markForCheck();
    });
  }

  onRemoveFile() {
    if (this.fileSelector) {
      this.data = null;
      this.fileSelector.nativeElement.value = '';
      this.textArea!.nativeElement.value = '';
    }
  }

  onTextAreaInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.data = target.value ?? null;
  }

  onTextAreaKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Tab') {
      return;
    }
    event.preventDefault();
    const el = this.textArea?.nativeElement;
    if (!el) {
      return;
    }
    el.setRangeText('\t', el.selectionStart, el.selectionEnd, 'end');
  }

  onSubmit() {
    this.traitDataTsv.emit(this.data);
  }

  isFileAttached() {
    return (this.fileSelector?.nativeElement.files?.length ?? -1) > 0;
  }
}

