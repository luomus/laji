import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KerttuInstructionsComponent } from './kerttu-instructions.component';

describe('KerttuInstructionsComponent', () => {
  let component: KerttuInstructionsComponent;
  let fixture: ComponentFixture<KerttuInstructionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KerttuInstructionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KerttuInstructionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
