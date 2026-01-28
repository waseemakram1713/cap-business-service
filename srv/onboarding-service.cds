using cap.business.customer as db from '../db/schema';

service OnboardingService {
  @requires: 'OnboardingViewer'
  entity CustomerOnboardings as projection on db.CustomerOnboarding;

  
  @requires: 'OnboardingAdmin'
  action SubmitForReview(ID : UUID);
}
