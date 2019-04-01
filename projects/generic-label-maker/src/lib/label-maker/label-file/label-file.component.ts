import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ISetup } from '../../generic-label-maker.interface';
import { LocalStorage } from 'ngx-webstorage';
import { LabelPrintComponent } from '../../label-print/label-print.component';

@Component({
  selector: 'll-label-file',
  templateUrl: './label-file.component.html',
  styleUrls: ['./label-file.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelFileComponent {

  @Input() newSetup: ISetup;
  @Input() setup: ISetup;
  @Input() data: object[];

  @LocalStorage('recent-files', []) recentFiles: {setup: ISetup, filename: string}[];

  @Output() html = new EventEmitter<string>();
  @Output() setupChange = new EventEmitter<ISetup>();
  @ViewChild('printBtn') printBtn: LabelPrintComponent;

  filename = '';

  constructor() { }

  onFileChange(evt: any) {
    const target: DataTransfer = <DataTransfer>(evt.target);
    if (target.files.length !== 1) {
      return;
    }
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      evt.target.value = '';
      const enc = new TextDecoder('utf-8');
      const data = JSON.parse(enc.decode(e.target.result));
      if (!data || data.version !== 1 || !data.setup) {
        return alert('Could not find label information from the file');
      }
      this.updateResentFiles(data.setup, this.filename);
      this.setupChange.emit(data.setup);
    };
    this.filename = target.files[0].name;
    if (this.filename.endsWith('.label') || this.filename.endsWith('.label.txt')) {
      reader.readAsArrayBuffer(target.files[0]);
    } else {
      evt.target.value = '';
      alert('Not a label setup');
    }
  }

  save() {
    let filename = prompt('Enter the label name');
    if (filename !== null && filename !== '') {
      filename += '.label';
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify({
        version: 1,
        setup: this.setup
      })));
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    }
  }

  print() {
    this.printBtn.renderPages();
  }

  private updateResentFiles(setup: ISetup, filename: string) {
    const idx = this.recentFiles.findIndex(i => i.filename === filename);
    if (idx === -1) {
      this.recentFiles = [
        {setup, filename},
        ...this.recentFiles.slice(-2)
      ];
    } else {
      this.recentFiles = [
        {setup, filename},
        ...this.recentFiles.slice(0, idx),
        ...this.recentFiles.slice(idx + 1),
      ];
    }
  }

  removeRecent(idx: number) {
    this.recentFiles = [
      ...this.recentFiles.slice(0, idx),
      ...this.recentFiles.slice(idx + 1),
    ];
  }

  makeNew() {
    if (confirm('Are you sure that you want to start a new empty label?')) {
      this.setupChange.emit(JSON.parse(JSON.stringify(this.newSetup)));
    }
  }
}
