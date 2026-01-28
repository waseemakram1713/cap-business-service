using { cuid } from '@sap/cds/common';

namespace cap.business.customer;

entity CustomerOnboarding : cuid {
  customerName        : String(100);
  country             : String(3);
  email               : String(100);
  status              : String(20);
  riskCategory        : String(20);
  @mandatory
  onboardingReason    : String(255);
}
