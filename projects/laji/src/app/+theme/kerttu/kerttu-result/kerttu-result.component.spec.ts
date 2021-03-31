import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KerttuResultComponent } from './kerttu-result.component';

describe('KerttuResultComponent', () => {
  let component: KerttuResultComponent;
  let fixture: ComponentFixture<KerttuResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KerttuResultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KerttuResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
