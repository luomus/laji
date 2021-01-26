import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedCollectionsComponent } from './selected-collections.component';

describe('SelectedCollectionsComponent', () => {
  let component: SelectedCollectionsComponent;
  let fixture: ComponentFixture<SelectedCollectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectedCollectionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedCollectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
