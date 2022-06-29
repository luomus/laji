import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentificationViewComponent } from './identification-view.component';

describe('IdentificationViewComponent', () => {
  let component: IdentificationViewComponent;
  let fixture: ComponentFixture<IdentificationViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IdentificationViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentificationViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
