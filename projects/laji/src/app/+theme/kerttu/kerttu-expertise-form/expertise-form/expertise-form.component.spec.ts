import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExpertiseFormComponent } from './expertise-form.component';

describe('ExpertiseFormComponent', () => {
  let component: ExpertiseFormComponent;
  let fixture: ComponentFixture<ExpertiseFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpertiseFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpertiseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
