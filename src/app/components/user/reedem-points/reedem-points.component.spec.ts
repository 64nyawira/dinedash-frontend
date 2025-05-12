import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReedemPointsComponent } from './reedem-points.component';

describe('ReedemPointsComponent', () => {
  let component: ReedemPointsComponent;
  let fixture: ComponentFixture<ReedemPointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReedemPointsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReedemPointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
