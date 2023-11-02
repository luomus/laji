import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentificationsComponent } from './identifications.component';

describe('IdentificationsComponent', () => {
  let component: IdentificationsComponent;
  let fixture: ComponentFixture<IdentificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IdentificationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
