import { Component, OnInit, Input, OnChanges, HostListener, ElementRef } from '@angular/core';

@Component({
  selector: 'iucn',
  templateUrl: 'iucn.component.html'
})
export class IUCNComponent implements OnInit, OnChanges {
  @Input() height = 60;
  @Input() selected;

  public width;
  public color;
  public plop = [
    {
      title: {first: 'Least', last: 'Concern'},
      value: 'LC'
    },
    {
      title: {first: 'Near', last: 'Threatend'},
      value: 'NT'
    },
    {
      title: {first: 'Vulnurable', last: ''},
      value: 'VU'
    },
    {
      title: {first: 'Endangered', last: ''},
      value: 'EN'
    },
    {
      title: {first: 'Critically', last: 'Endangered'},
      value: 'CR'
    },
    {
      title: {first: 'Extinct', last: 'In The Wild'},
      value: 'EW'
    },
    {
      title: {first: 'Extinct', last: ''},
      value: 'EX'
    }
  ];

  constructor(private el: ElementRef) {
  }

  @HostListener('window:resize')
  onResize() {
    this.width = this.el.nativeElement.parentNode.offsetWidth;
  }

  ngOnInit() {
    this.initColor();
    this.onResize();
  }

  ngOnChanges() {
    this.initColor();
  }

  private initColor() {
    switch (this.selected) {
      case 'LC':
        this.color = '#96CEB4';
        break;
      case 'NT':
        this.color = '#96CEB4';
        break;
      case 'EW':
        this.color = '#FF6F69';
        break;
      case 'EX':
        this.color = '#FF6F69';
        break;
      default:
        this.color = '#FFCC5C';
    }
  };

}
