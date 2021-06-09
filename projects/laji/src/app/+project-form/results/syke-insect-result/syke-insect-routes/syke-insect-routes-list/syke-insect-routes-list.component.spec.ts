import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SykeInsectRoutesListComponent } from './syke-insect-routes-list.component';

describe('SykeInsectRoutesListComponent', () => {
  let component: SykeInsectRoutesListComponent;
  let fixture: ComponentFixture<SykeInsectRoutesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SykeInsectRoutesListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SykeInsectRoutesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
