import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KerttuCountComponent } from './kerttu-count.component';

describe('KerttuCountComponent', () => {
  let component: KerttuCountComponent;
  let fixture: ComponentFixture<KerttuCountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KerttuCountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KerttuCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
