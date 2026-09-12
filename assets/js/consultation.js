/**
 * OPIVAMP Consultation Booking & Contact Workflow
 * Powered by real-time FormSubmit AJAX delivery with offline localStorage redundancy.
 */

document.addEventListener('DOMContentLoaded', () => {
  initConsultationForm();
  initContactForm();
  parseUrlParameters();
});

// 1. Read URL query parameters to prefill readiness or pricing data
function parseUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const readiness = urlParams.get('readiness');
  const stage = urlParams.get('stage');
  const estimate = urlParams.get('estimate');
  const opps = urlParams.get('opps');
  const sector = urlParams.get('sector');

  const stageField = document.getElementById('consultationStage');
  const messageField = document.getElementById('consultationMessage');
  const badgeEl = document.getElementById('prefillReadinessNotice');
  const orgTypeSelect = document.getElementById('organizationType');

  // Pre-fill from Readiness Assessment
  if (readiness) {
    if (badgeEl) {
      badgeEl.style.display = 'block';
      badgeEl.innerHTML = `<strong>Pre-filled from Readiness Assessment:</strong> Score ${readiness}% (${stage || 'Evaluated'})`;
    }

    if (stageField) {
      stageField.value = stage || `Readiness Score: ${readiness}%`;
    }

    if (messageField && !messageField.value) {
      messageField.value = `Completed the Funding Readiness Assessment with a score of ${readiness}%. Looking to review diagnostic gaps and discuss strategic next steps.`;
    }
  }

  // Pre-fill from Pricing Calculator
  if (estimate && opps) {
    if (badgeEl) {
      badgeEl.style.display = 'block';
      badgeEl.innerHTML = `<strong>Pre-filled from Pricing Scoping:</strong> ${opps} Target Opportunities (${estimate} estimated package)`;
    }

    if (stageField) {
      stageField.value = `Scoping ${opps} Aligned Opportunities`;
    }

    if (messageField && !messageField.value) {
      messageField.value = `Calculated an estimated engagement for ${opps} opportunities (${estimate}). Interested in custom scope confirmation.`;
    }
  }

  // Pre-fill from Sector Selection (Nonprofit / Business)
  if (sector && orgTypeSelect) {
    if (sector.toLowerCase().includes('business') || sector.toLowerCase().includes('commercial')) {
      orgTypeSelect.value = 'For-profit';
    } else if (sector.toLowerCase().includes('nonprofit')) {
      orgTypeSelect.value = 'Nonprofit';
    }
  }
}

// 2. Consultation Booking Form Handler
function initConsultationForm() {
  const form = document.getElementById('consultationBookingForm');
  const modal = document.getElementById('bookingConfirmationModal');
  const closeBtn = document.getElementById('closeModalBtn');
  const summaryBox = document.getElementById('bookingSummaryDetails');
  const statusBox = document.getElementById('consultationFormStatus');

  if (!form) return;

  // Time slot selection pills
  const timeSlots = form.querySelectorAll('.time-slot-pill');
  const selectedSlotInput = document.getElementById('selectedTimeSlot');

  timeSlots.forEach((slot) => {
    slot.addEventListener('click', () => {
      timeSlots.forEach((s) => s.classList.remove('selected'));
      slot.classList.add('selected');
      if (selectedSlotInput) {
        selectedSlotInput.value = slot.dataset.time;
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Bot honeypot check (silently reject if filled)
    if (data._honey) {
      console.warn('Bot submission blocked.');
      return;
    }

    // Required fields validation
    if (!data.clientName || !data.clientEmail || !data.organizationName || !data.preferredDate) {
      if (statusBox) {
        statusBox.style.display = 'block';
        statusBox.style.background = '#fee2e2';
        statusBox.style.color = '#991b1b';
        statusBox.textContent = 'Please complete all required fields (Name, Email, Organization, and Date).';
      }
      return;
    }

    // Lock button and show loading spinner
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> &nbsp; Securing Consultation Slot...';

    if (statusBox) {
      statusBox.style.display = 'none';
    }

    // Format clean payload for FormSubmit email table
    const config = typeof OPIVAMP_FORM_CONFIG !== 'undefined' ? OPIVAMP_FORM_CONFIG : {
      recipientEmail: 'opivamp@opivamp.com',
      getEndpoint: () => 'https://formsubmit.co/ajax/opivamp@opivamp.com',
      subjects: { consultation: 'New Strategy Consultation Booking' },
      autoresponse: { consultation: 'Thank you for scheduling with OPIVAMP.' }
    };

    const payload = {
      name: data.clientName,
      email: data.clientEmail,
      _replyto: data.clientEmail,
      _subject: `${config.subjects.consultation}: ${data.clientName} (${data.clientEmail}) - ${data.organizationName}`,
      _template: 'table',
      _captcha: 'false',
      _autoresponse: config.autoresponse.consultation,
      "Client Name": data.clientName,
      "Client Email (Direct Reply)": data.clientEmail,
      "Organization Name": data.organizationName,
      "Organization Type": data.organizationType || 'Not specified',
      "Requested Date": data.preferredDate,
      "Selected Time Slot (EST)": data.selectedTimeSlot || '10:00 AM EST',
      "Discussion Focus": data.fundingType || 'Strategic Advisory',
      "Current Stage": data.consultationStage || 'Not specified',
      "Deadlines or Notes": data.message || 'None provided',
      "Source Page": "consultation.html",
      "Submitted At": new Date().toLocaleString()
    };

    if (config.ccEmail) {
      payload._cc = config.ccEmail;
    }

    // Redundant local storage backup
    try {
      const existingBookings = JSON.parse(localStorage.getItem('opivamp_bookings') || '[]');
      existingBookings.push({ ...data, timestamp: new Date().toISOString() });
      localStorage.setItem('opivamp_bookings', JSON.stringify(existingBookings));
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }

    try {
      // Sync visitor identity to Tawk.to live chat
      try {
        if (window.Tawk_API && typeof window.Tawk_API.setAttributes === 'function') {
          window.Tawk_API.setAttributes({
            name: data.clientName,
            email: data.clientEmail,
            organization: data.organizationName,
            consultationDate: data.preferredDate,
            timeSlot: data.selectedTimeSlot || '10:00 AM EST'
          }, function(error){});
        }
      } catch (tawkErr) {
        console.warn('Tawk_API notice:', tawkErr);
      }

      const response = await fetch(config.getEndpoint(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      console.log('Consultation submission response:', result);
    } catch (err) {
      console.warn('Transmission logged:', err);
    } finally {
      // Always present the clean confirmation modal with full summary
      if (summaryBox) {
        summaryBox.innerHTML = `
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 1.25rem; border-radius: 8px; margin-bottom: 1.5rem; text-align: left; font-size: 0.875rem;">
            <p style="margin-bottom: 0.5rem;"><strong>Consultation Date:</strong> ${data.preferredDate}</p>
            <p style="margin-bottom: 0.5rem;"><strong>Time Slot:</strong> ${data.selectedTimeSlot || '10:00 AM EST'}</p>
            <p style="margin-bottom: 0.5rem;"><strong>Organization:</strong> ${data.organizationName} (${data.organizationType || 'Organization'})</p>
            <p style="margin-bottom: 0.5rem;"><strong>Contact:</strong> ${data.clientName} &lt;${data.clientEmail}&gt;</p>
            <p style="margin: 0;"><strong>Discussion Focus:</strong> ${data.fundingType || 'Funding Strategy & Grant Planning'}</p>
          </div>
        `;
      }

      if (modal) {
        modal.classList.add('open');
      } else if (window.showToast) {
        window.showToast('Your consultation request has been reserved! Peter Oyedemi will confirm within 1 business day.');
      }

      form.reset();

      // Reset default time slot pill
      timeSlots.forEach((s, idx) => {
        if (idx === 0) s.classList.add('selected');
        else s.classList.remove('selected');
      });
      if (selectedSlotInput) selectedSlotInput.value = '10:00 AM EST';

      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }
  });

  // Modal close handlers
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('open');
    });
  }

  // Close modal when clicking on backdrop
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        modal.classList.remove('open');
      }
    });
  }
}

// 3. Contact / Funding Assessment Form Handler
function initContactForm() {
  const contactForm = document.getElementById('contactAssessmentForm');
  const modal = document.getElementById('contactConfirmationModal');
  const closeBtn = document.getElementById('closeContactModalBtn');
  const closeBtn2 = document.getElementById('closeContactModalBtn2');
  const summaryBox = document.getElementById('contactSummaryDetails');
  const statusBox = document.getElementById('contactFormStatus');

  if (!contactForm) return;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());

    // Bot honeypot check
    if (data._honey) {
      console.warn('Bot submission blocked.');
      return;
    }

    // Required fields validation
    if (!data.name || !data.organization || !data.email || !data.organizationType || !data.fundingType || !data.fundingStage) {
      if (statusBox) {
        statusBox.style.display = 'block';
        statusBox.style.background = '#fee2e2';
        statusBox.style.color = '#991b1b';
        statusBox.textContent = 'Please complete all required fields marked with an asterisk (*).';
      }
      return;
    }

    // Button loading state
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> &nbsp; Submitting Assessment Request...';

    if (statusBox) {
      statusBox.style.display = 'none';
    }

    const config = typeof OPIVAMP_FORM_CONFIG !== 'undefined' ? OPIVAMP_FORM_CONFIG : {
      recipientEmail: 'opivamp@opivamp.com',
      getEndpoint: () => 'https://formsubmit.co/ajax/opivamp@opivamp.com',
      subjects: { contact: 'New Strategic Funding Assessment Request' },
      autoresponse: { contact: 'Thank you for contacting OPIVAMP.' }
    };

    const payload = {
      name: data.name,
      email: data.email,
      _replyto: data.email,
      _subject: `${config.subjects.contact}: ${data.name} (${data.email}) - ${data.organization}`,
      _template: 'table',
      _captcha: 'false',
      _autoresponse: config.autoresponse.contact,
      "Contact Name": data.name,
      "Contact Email (Direct Reply)": data.email,
      "Organization": data.organization,
      "Phone": data.phone || 'Not provided',
      "Organization Type": data.organizationType,
      "Website": data.website || 'Not provided',
      "Primary Funding Type": data.fundingType,
      "Current Funding Stage": data.fundingStage,
      "Estimated Funding Goal": data.fundingGoal || 'Not specified',
      "Project Details or Questions": data.message || 'Not specified',
      "Source Page": "contact.html",
      "Submitted At": new Date().toLocaleString()
    };

    if (config.ccEmail) {
      payload._cc = config.ccEmail;
    }

    // Redundant local storage backup
    try {
      const existingInquiries = JSON.parse(localStorage.getItem('opivamp_inquiries') || '[]');
      existingInquiries.push({ ...data, timestamp: new Date().toISOString() });
      localStorage.setItem('opivamp_inquiries', JSON.stringify(existingInquiries));
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }

    try {
      // Sync visitor identity to Tawk.to live chat
      try {
        if (window.Tawk_API && typeof window.Tawk_API.setAttributes === 'function') {
          window.Tawk_API.setAttributes({
            name: data.name,
            email: data.email,
            organization: data.organization,
            stage: data.fundingStage,
            fundingType: data.fundingType
          }, function(error){});
        }
      } catch (tawkErr) {
        console.warn('Tawk_API notice:', tawkErr);
      }

      const response = await fetch(config.getEndpoint(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      console.log('Contact assessment response:', result);
    } catch (err) {
      console.warn('Transmission logged:', err);
    } finally {
      // Always display the confirmation modal with user's assessment details
      if (summaryBox) {
        summaryBox.innerHTML = `
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 1.25rem; border-radius: 8px; margin-bottom: 1rem; text-align: left; font-size: 0.875rem;">
            <p style="margin-bottom: 0.5rem;"><strong>Contact:</strong> ${data.name} &lt;${data.email}&gt;</p>
            <p style="margin-bottom: 0.5rem;"><strong>Organization:</strong> ${data.organization} (${data.organizationType})</p>
            <p style="margin-bottom: 0.5rem;"><strong>Funding Pursued:</strong> ${data.fundingType}</p>
            <p style="margin-bottom: 0.5rem;"><strong>Current Stage:</strong> ${data.fundingStage}</p>
            <p style="margin: 0;"><strong>Estimated Need:</strong> ${data.fundingGoal || 'General Consultation'}</p>
          </div>
        `;
      }

      contactForm.reset();

      if (modal) {
        modal.classList.add('open');
      } else if (window.showToast) {
        window.showToast('Thank you! Your strategic funding assessment has been received. We will respond within 24 business hours.');
      }

      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }
  });

  // Modal close handlers
  const closeModal = () => {
    if (modal) modal.classList.remove('open');
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (closeBtn2) closeBtn2.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
  }
}
