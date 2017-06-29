import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { Annotation } from '../../../shared/model/Annotation';
import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'laji-annotation-list',
  templateUrl: './annotation-list.component.html',
  styleUrls: ['./annotation-list.component.css']
})
export class AnnotationListComponent implements OnInit {

  @Input() annotations: Annotation[];
  @Input() personID: string;
  @Output() onDelete = new EventEmitter<Annotation>();

  types = Annotation.TypeEnum;
  annotationClass = Annotation.AnnotationClassEnum;
  changingLocale = false;

  constructor() { }

  ngOnInit() {
  }


}
