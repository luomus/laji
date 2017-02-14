import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'laji-np-edit-form',
  templateUrl: './np-edit-form.component.html',
  styleUrls: ['./np-edit-form.component.css']
})
export class NpEditFormComponent implements OnInit {
  @Input() lang: string;
  @Input() formData: any;
  tick = 0;

  constructor() { }

  ngOnInit() {
  }

  onChange() {

  }

  onSubmit() {

  }
}
