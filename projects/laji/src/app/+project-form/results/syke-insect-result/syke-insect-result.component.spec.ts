import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SykeInsectResultComponent } from './syke-insect-result.component';

describe('SykeInsectResultComponent', () => {
  let component: SykeInsectResultComponent;
  let fixture: ComponentFixture<SykeInsectResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SykeInsectResultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SykeInsectResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
