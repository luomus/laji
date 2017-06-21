import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { ViewChild } from '@angular/core';
import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'laji-annotations',
  templateUrl: './annotations.component.html',
  styleUrls: ['./annotations.component.css']
})
export class AnnotationsComponent implements OnInit {
  @ViewChild('childModal') public modal: ModalDirective;

  @Input() rootID: string;
  @Input() targetID: string;
  @Input() personID: string;
  @Input() type: 'MAN.typeTaxon'| 'MAN.typeInvasiveControlEffectiveness' = 'MAN.typeTaxon';
  @Output() close = new EventEmitter<any>();
  error = false;
  annotation: any = {};

  constructor() { }

  ngOnInit() {
  }

  closeError() {

  }

  sendAnnotation() {

  }
}
