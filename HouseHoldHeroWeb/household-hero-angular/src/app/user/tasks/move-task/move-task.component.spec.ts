import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveTaskComponent } from './move-task.component';

describe('MoveTaskComponent', () => {
  let component: MoveTaskComponent;
  let fixture: ComponentFixture<MoveTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoveTaskComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MoveTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
