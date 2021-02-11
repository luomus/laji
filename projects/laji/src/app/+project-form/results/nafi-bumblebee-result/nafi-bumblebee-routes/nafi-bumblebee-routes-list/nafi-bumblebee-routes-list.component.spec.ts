import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NafiBumblebeeRoutesListComponent } from './nafi-bumblebee-routes-list.component';

describe('NafiBumblebeeRoutesListComponent', () => {
  let component: NafiBumblebeeRoutesListComponent;
  let fixture: ComponentFixture<NafiBumblebeeRoutesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NafiBumblebeeRoutesListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NafiBumblebeeRoutesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
