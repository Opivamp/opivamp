/**
 * OPIVAMP Consultation Booking & Contact Workflow
 */

document.addEventListener('DOMContentLoaded', () => {
  initConsultationForm();
  initContactForm();
  parseUrlParameters();
});

// 1. Read URL query parameters to prefill readiness data
function parseUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const readiness = urlParams.get('readiness');
  const stage = urlParams.get('stage');

  if (readiness) {
    const stageField = document.getElementById('consultationStage');
    const messageField = document.getElementById('consultationMessage');
    const badgeEl = document.getElementById('prefillReadinessNotice');

    if (badgeEl) {
      badgeEl.style.display = 'block';
      badgeEl.innerHTML = `<strong>Pre-filled from Readiness Assessment:</strong> Score ${readiness}% (${stage || 'Evaluated'})`;
    }

    if (stageField) {
      stageField.value = stage || `Readiness Score: ${readiness}%`;
    }

    if (messageField && !messageField.value) {
      messageField.value = `Completed the Funding Readiness Assessment with a score of ${readiness}%. Looking to discuss strategic next steps.`;
    }
  }
}

// 2. Consultation Booking Form
function initConsultationForm() {
  const form = document.getElementById('consultationBookingForm');
  const modal = document.getElementById('bookingConfirmationModal');
  const closeBtn = document.getElementById('closeModalBtn');
  const summaryBox = document.getElementById('bookingSummaryDetails');

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

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Basic required check
    if (!data.clientName || !data.clientEmail || !data.organizationName) {
      alert('Please provide your name, email, and organization.');
      return;
    }

    // Save lead locally to localStorage for persistence
    const existingBookings = JSON.parse(localStorage.getItem('opivamp_bookings') || '[]');
    existingBookings.push({
      ...data,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('opivamp_bookings', JSON.stringify(existingBookings));

    // Populate modal summary
    if (summaryBox) {
      summaryBox.innerHTML = `
        <div style="background: #f8fafc; padding: 1.25rem; border-radius: 8px; margin-bottom: 1.5rem; text-align: left; font-size: 0.875rem;">
          <p style="margin-bottom: 0.5rem;"><strong>Consultation Date:</strong> ${data.preferredDate || 'Next available advisory slot'}</p>
          <p style="margin-bottom: 0.5rem;"><strong>Time:</strong> ${data.selectedTimeSlot || '10:00 AM EST'}</p>
          <p style="margin-bottom: 0.5rem;"><strong>Organization:</strong> ${data.organizationName} (${data.organizationType || 'Organization'})</p>
          <p style="margin-bottom: 0.5rem;"><strong>Contact:</strong> ${data.clientName} &lt;${data.clientEmail}&gt;</p>
          <p style="margin: 0;"><strong>Discussion Focus:</strong> ${data.fundingType || 'Funding Strategy & Grant Planning'}</p>
        </div>
      `;
    }

    if (modal) {
      modal.classList.add('open');
    } else {
      if (window.showToast) {
        window.showToast('Your consultation request has been reserved. Victor Peter will confirm within 1 business day.');
      }
    }
  });

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('open');
      form.reset();
    });
  }
}

// 3. Contact / Assessment Form
function initContactForm() {
  const contactForm = document.getElementById('contactAssessmentForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());

    // Save lead locally
    const existingInquiries = JSON.parse(localStorage.getItem('opivamp_inquiries') || '[]');
    existingInquiries.push({
      ...data,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('opivamp_inquiries', JSON.stringify(existingInquiries));

    contactForm.reset();

    if (window.showToast) {
      window.showToast('Thank you! Your funding assessment request has been received. We will respond within 24 business hours.');
    } else {
      alert('Thank you! Your funding assessment request has been received.');
    }
  });
}
