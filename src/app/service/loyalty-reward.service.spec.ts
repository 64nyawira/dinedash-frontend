import { TestBed } from '@angular/core/testing';

import { LoyaltyRewardService } from './loyalty-reward.service';

describe('LoyaltyRewardService', () => {
  let service: LoyaltyRewardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoyaltyRewardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
