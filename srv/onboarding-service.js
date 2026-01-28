const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {

  const { CustomerOnboardings } = this.entities;

  // Validation before save
  this.before(['CREATE', 'UPDATE'], CustomerOnboardings, (req) => {
    if (req.data.country === 'DE' && !req.data.email) {
      req.error(400, 'Email is mandatory for customers in Germany');
    }
  });

  // Custom action
  this.on('SubmitForReview', async (req) => {
    const { ID } = req.data;

    const tx = cds.transaction(req);
    const customer = await tx.read(CustomerOnboardings).where({ ID });

    if (!customer.length) {
      return req.error(404, 'Customer onboarding request not found');
    }

    if (customer[0].status === 'SUBMITTED') {
      return req.error(400, 'Request already submitted');
    }

    await tx.update(CustomerOnboardings)
      .set({ status: 'SUBMITTED' })
      .where({ ID });

    return { ID, status: 'SUBMITTED' };
  });

});
