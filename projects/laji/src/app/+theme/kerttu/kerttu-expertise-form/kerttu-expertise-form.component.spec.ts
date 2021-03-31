import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { KerttuExpertiseFormComponent } from './kerttu-expertise-form.component';

describe('KerttuExpertiseFormComponent', () => {
  let component: KerttuExpertiseFormComponent;
  let fixture: ComponentFixture<KerttuExpertiseFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ KerttuExpertiseFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KerttuExpertiseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
