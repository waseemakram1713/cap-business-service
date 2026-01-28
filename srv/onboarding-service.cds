using cap.business.customer as db from '../db/schema';

service OnboardingService {

  entity CustomerOnboardings as projection on db.CustomerOnboarding;

  action SubmitForReview(ID : UUID);
}
