import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KerttuExpertiseFormComponent } from './kerttu-expertise-form.component';

describe('KerttuExpertiseFormComponent', () => {
  let component: KerttuExpertiseFormComponent;
  let fixture: ComponentFixture<KerttuExpertiseFormComponent>;

  beforeEach(async(() => {
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
