import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BirdPointCountResultComponent } from './bird-point-count-result.component';

describe('BirdPointCountResultComponent', () => {
  let component: BirdPointCountResultComponent;
  let fixture: ComponentFixture<BirdPointCountResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BirdPointCountResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BirdPointCountResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
