/**
 * OPIVAMP Interactive Funding Readiness Self-Assessment
 * Calculates readiness tiers and provides real-time scorecard report submission.
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

  // Track latest score state for submission
  let currentAssessmentState = {
    percent: 0,
    checkedCount: 0,
    totalCount: checkboxes.length,
    tier: '',
    checkedItems: [],
    uncheckedItems: []
  };

  const updateScore = () => {
    const total = checkboxes.length;
    let checked = 0;
    const checkedLabels = [];
    const uncheckedLabels = [];

    checkboxes.forEach((cb) => {
      const labelEl = cb.closest('.assessment-item').querySelector('h4');
      const label = labelEl ? labelEl.textContent : cb.value;
      if (cb.checked) {
        checked++;
        checkedLabels.push(label);
      } else {
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

    // Update state object
    currentAssessmentState = {
      percent,
      checkedCount: checked,
      totalCount: total,
      tier,
      checkedItems: checkedLabels,
      uncheckedItems: uncheckedLabels
    };
  };

  checkboxes.forEach((cb) => {
    cb.addEventListener('change', updateScore);
  });

  // Run once to initialize
  updateScore();

  // 2. Email Scorecard Report Form
  const scorecardForm = document.getElementById('emailScorecardForm');
  const scorecardStatus = document.getElementById('scorecardStatusMsg');

  if (scorecardForm) {
    scorecardForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(scorecardForm);
      const data = Object.fromEntries(formData.entries());

      if (data._honey) {
        console.warn('Bot blocked.');
        return;
      }

      if (!data.name || !data.email || !data.organization) {
        if (scorecardStatus) {
          scorecardStatus.style.display = 'block';
          scorecardStatus.style.background = 'rgba(239, 68, 68, 0.2)';
          scorecardStatus.style.color = '#fecaca';
          scorecardStatus.textContent = 'Please provide your name, organization, and email address.';
        }
        return;
      }

      const submitBtn = scorecardForm.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> &nbsp; Sending...';

      if (scorecardStatus) {
        scorecardStatus.style.display = 'none';
      }

      const config = typeof OPIVAMP_FORM_CONFIG !== 'undefined' ? OPIVAMP_FORM_CONFIG : {
        recipientEmail: 'inquiries@opivamp.com',
        getEndpoint: () => 'https://formsubmit.co/ajax/inquiries@opivamp.com',
        subjects: { readiness: 'Funding Readiness Assessment Report' },
        autoresponse: { readiness: 'Thank you for completing your readiness assessment with OPIVAMP.' }
      };

      const payload = {
        _subject: `${config.subjects.readiness}: ${currentAssessmentState.percent}% - ${data.name} (${data.organization})`,
        _template: 'table',
        _captcha: 'false',
        _replyto: data.email,
        _autoresponse: `${config.autoresponse.readiness} Your score: ${currentAssessmentState.percent}% (${currentAssessmentState.tier}). Our team will review your preparation roadmap.`,
        "Contact Name": data.name,
        "Organization Name": data.organization,
        "Work Email": data.email,
        "Readiness Score": `${currentAssessmentState.percent}% (${currentAssessmentState.checkedCount} of ${currentAssessmentState.totalCount} Core Elements)`,
        "Readiness Tier": currentAssessmentState.tier,
        "Prepared Elements": currentAssessmentState.checkedItems.join('; ') || 'None selected',
        "Priority Improvement Gaps": currentAssessmentState.uncheckedItems.join('; ') || 'All elements prepared',
        "Source Page": "readiness.html",
        "Submitted At": new Date().toLocaleString()
      };

      if (config.ccEmail) {
        payload._cc = config.ccEmail;
      }

      // Redundant local storage backup
      try {
        const existingLeads = JSON.parse(localStorage.getItem('opivamp_readiness_leads') || '[]');
        existingLeads.push({ ...data, ...currentAssessmentState, timestamp: new Date().toISOString() });
        localStorage.setItem('opivamp_readiness_leads', JSON.stringify(existingLeads));
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }

      try {
        const response = await fetch(config.getEndpoint(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.success === 'true' || result.success === true || (result.message && result.message.includes('Activation'))) {
          if (scorecardStatus) {
            scorecardStatus.style.display = 'block';
            scorecardStatus.style.background = 'rgba(16, 185, 129, 0.2)';
            scorecardStatus.style.color = '#a7f3d0';
            scorecardStatus.innerHTML = `✓ <strong>Scorecard Dispatched!</strong> We've logged your ${currentAssessmentState.percent}% score for Victor Peter's review. Check your inbox for confirmation.`;
          }

          if (window.showToast) {
            window.showToast('Your readiness breakdown has been emailed! Book below to review it.');
          }

          // Update the consultation button to include client info
          if (consultBtn) {
            consultBtn.href = `consultation.html?readiness=${currentAssessmentState.percent}&stage=${encodeURIComponent(currentAssessmentState.tier)}`;
          }

          scorecardForm.reset();
        } else {
          throw new Error(result.message || 'Submission failed');
        }
      } catch (err) {
        console.error('Scorecard submission error:', err);
        if (scorecardStatus) {
          scorecardStatus.style.display = 'block';
          scorecardStatus.style.background = 'rgba(245, 158, 11, 0.2)';
          scorecardStatus.style.color = '#fde68a';
          scorecardStatus.innerHTML = `Scorecard saved locally! You can also email Victor directly at <a href="mailto:${config.recipientEmail}" style="color:#ffffff; text-decoration:underline;">${config.recipientEmail}</a>.`;
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    });
  }
});
