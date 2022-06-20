import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentificationPanelComponent } from './identification-panel.component';

describe('IdentificationPanelComponent', () => {
  let component: IdentificationPanelComponent;
  let fixture: ComponentFixture<IdentificationPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IdentificationPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentificationPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
