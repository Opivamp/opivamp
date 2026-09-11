/**
 * OPIVAMP Pricing & Multi-Opportunity Strategy Calculator
 */

document.addEventListener('DOMContentLoaded', () => {
  const oppSlider = document.getElementById('oppRange');
  const oppCountDisplay = document.getElementById('oppCountDisplay');
  const appCountDisplay = document.getElementById('appCountDisplay');
  const researchTotalDisplay = document.getElementById('researchTotalDisplay');
  const appTotalDisplay = document.getElementById('appTotalDisplay');
  const discountDisplay = document.getElementById('discountDisplay');
  const discountRow = document.getElementById('discountRow');
  const finalTotalDisplay = document.getElementById('finalTotalDisplay');

  if (!oppSlider) return;

  const calculateEstimate = () => {
    const opps = parseInt(oppSlider.value, 10);
    const researchRate = 50; // $50 per aligned opportunity
    const applicationRate = 150; // $150 per grant application

    // Subtotals
    const researchSubtotal = opps * researchRate;
    const applicationSubtotal = opps * applicationRate;

    // Multi-opportunity incentive: 30% off the 5th application fee ($45 off)
    let discount = 0;
    if (opps >= 5) {
      discount = Math.round(applicationRate * 0.3); // $45
    }

    const grandTotal = researchSubtotal + applicationSubtotal - discount;

    if (oppCountDisplay) oppCountDisplay.textContent = opps;
    if (appCountDisplay) appCountDisplay.textContent = opps;
    if (researchTotalDisplay) researchTotalDisplay.textContent = `$${researchSubtotal.toLocaleString()}`;
    if (appTotalDisplay) appTotalDisplay.textContent = `$${applicationSubtotal.toLocaleString()}`;

    if (discountDisplay && discountRow) {
      if (discount > 0) {
        discountRow.style.display = 'flex';
        discountDisplay.textContent = `-$${discount} (30% off 5th Application Fee)`;
      } else {
        discountRow.style.display = 'none';
      }
    }

    if (finalTotalDisplay) {
      finalTotalDisplay.textContent = `$${grandTotal.toLocaleString()}`;
    }

    const planBtn = document.getElementById('pricingCustomPlanBtn');
    if (planBtn) {
      planBtn.href = `consultation.html?estimate=%24${grandTotal.toLocaleString()}&opps=${opps}`;
    }
  };

  oppSlider.addEventListener('input', calculateEstimate);
  calculateEstimate();
});
