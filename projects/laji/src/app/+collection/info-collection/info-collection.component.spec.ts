import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoCollectionComponent } from './info-collection.component';

describe('InfoCollectionComponent', () => {
  let component: InfoCollectionComponent;
  let fixture: ComponentFixture<InfoCollectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoCollectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
