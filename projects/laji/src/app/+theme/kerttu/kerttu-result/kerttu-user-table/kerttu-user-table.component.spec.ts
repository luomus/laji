import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KerttuUserTableComponent } from './kerttu-user-table.component';

describe('KerttuUserTableComponent', () => {
  let component: KerttuUserTableComponent;
  let fixture: ComponentFixture<KerttuUserTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KerttuUserTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KerttuUserTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
