import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { KerttuInstructionsComponent } from './kerttu-instructions.component';

describe('KerttuInstructionsComponent', () => {
  let component: KerttuInstructionsComponent;
  let fixture: ComponentFixture<KerttuInstructionsComponent>;

  beforeEach(waitForAsync(() => {
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
