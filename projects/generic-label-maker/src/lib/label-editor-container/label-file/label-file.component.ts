import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Setup } from '../../generic-label-maker.interface';

@Component({
  selector: 'll-label-file',
  templateUrl: './label-file.component.html',
  styleUrls: ['./label-file.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelFileComponent implements OnInit {

  @Input() setup: Setup;
  @Input() data: object[];

  @Output() html = new EventEmitter<string>();
  @Output() setupChange = new EventEmitter<Setup>();

  filename = '';

  constructor() { }

  ngOnInit() {
  }

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
      this.setupChange.emit(data.setup);
    };
    this.filename = target.files[0].name;
    if (this.filename.endsWith('.label')) {
      reader.readAsArrayBuffer(target.files[0]);
    } else {
      evt.target.value = '';
      alert('Not a label setup');
    }
  }

  save() {
    let filename = prompt('Enter the label name');
    if (filename !== null || filename !== '') {
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
}
