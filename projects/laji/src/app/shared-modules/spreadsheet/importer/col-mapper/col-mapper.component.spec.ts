import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColMapperComponent } from './col-mapper.component';

describe('ColMapperComponent', () => {
  let component: ColMapperComponent;
  let fixture: ComponentFixture<ColMapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColMapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColMapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
