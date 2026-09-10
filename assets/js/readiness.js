/**
 * OPIVAMP Interactive Funding Readiness Self-Assessment
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('readinessAssessmentForm');
  if (!form) return;

  const checkboxes = form.querySelectorAll('input[type="checkbox"]');
  const resultCard = document.getElementById('readinessResultCard');
  const scorePercentEl = document.getElementById('scorePercent');
  const scoreBarEl = document.getElementById('scoreBarFill');
  const tierTitleEl = document.getElementById('tierTitle');
  const tierDescEl = document.getElementById('tierDesc');
  const checkedCountEl = document.getElementById('checkedCount');
  const recommendationListEl = document.getElementById('recommendationList');
  const consultBtn = document.getElementById('readinessConsultBtn');

  const updateScore = () => {
    const total = checkboxes.length;
    let checked = 0;
    const uncheckedLabels = [];

    checkboxes.forEach((cb) => {
      if (cb.checked) {
        checked++;
      } else {
        const label = cb.closest('.assessment-item').querySelector('h4').textContent;
        uncheckedLabels.push(label);
      }
    });

    const percent = Math.round((checked / total) * 100);

    if (checkedCountEl) checkedCountEl.textContent = `${checked} of ${total} Core Elements Prepared`;
    if (scorePercentEl) scorePercentEl.textContent = `${percent}%`;
    if (scoreBarEl) scoreBarEl.style.width = `${percent}%`;

    // Tier calculation
    let tier = '';
    let description = '';
    let colorClass = '';

    if (percent >= 80) {
      tier = 'High Readiness — Competitive Candidate';
      description = 'Your organization has built a solid operational foundation. You are well-positioned to identify aligned funding opportunities, build rigorous proposals, and establish a multi-funder pipeline.';
    } else if (percent >= 50) {
      tier = 'Developing Readiness — Strategic Refinement Needed';
      description = 'You possess a strong sense of purpose, but key operational elements (such as outcome metrics, budget narrative details, or compliance paperwork) need tightening to maximize funder evaluation scores.';
    } else {
      tier = 'Foundational Phase — Readiness Building Prioritized';
      description = 'Before investing significant resources into proposal drafting, prioritize strengthening your program descriptions, organizational documentation, and financial clarity to avoid wasted submission fees.';
    }

    if (tierTitleEl) tierTitleEl.textContent = tier;
    if (tierDescEl) tierDescEl.textContent = description;

    // Render action checklist
    if (recommendationListEl) {
      recommendationListEl.innerHTML = '';
      if (uncheckedLabels.length === 0) {
        recommendationListEl.innerHTML = '<li>✓ Exceptional preparation! Your organization is fully prepared to enter Phase 1: Strategic Research & Pipeline Development.</li>';
      } else {
        uncheckedLabels.slice(0, 4).forEach((item) => {
          const li = document.createElement('li');
          li.textContent = `Priority Focus: Establish verified ${item.toLowerCase()} before submitting large applications.`;
          recommendationListEl.appendChild(li);
        });
      }
    }

    if (resultCard) {
      resultCard.classList.add('active');
    }

    if (consultBtn) {
      consultBtn.href = `consultation.html?readiness=${percent}&stage=${encodeURIComponent(tier)}`;
    }
  };

  checkboxes.forEach((cb) => {
    cb.addEventListener('change', updateScore);
  });

  // Run once to show initial state if any are checked
  updateScore();
});
