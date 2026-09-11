/**
 * OPIVAMP Form & Notification Configuration
 * 
 * Centralized settings for real-time form submissions across all pages:
 * - Contact Assessment Form (contact.html)
 * - Consultation Booking Form (consultation.html)
 * - Funding Readiness Scorecard (readiness.html)
 * 
 * NOTE FOR PETER / SITE OWNER:
 * Enter the email address where you want to receive client inquiries below.
 * You can use opivamp@opivamp.com or your personal Gmail / Outlook address.
 * 
 * First-Time Activation:
 * The very first time a form is submitted to an email address, FormSubmit
 * sends an email with an "Activate Form" button to that inbox. Click it once,
 * and all future inquiries will immediately land directly in your inbox in real time!
 */

const OPIVAMP_FORM_CONFIG = {
  // Primary email address to receive all submissions
  recipientEmail: "opivamp@opivamp.com",

  // Optional secondary email to CC (receives automatic copy)
  ccEmail: "opivamp@gmail.com",

  // Business branding
  businessName: "OPIVAMP GRANTS — Global Funding Strategy & Consulting",
  contactPhone: "(555) 019-2834",

  // Email subject line prefixes
  subjects: {
    contact: "New Strategic Funding Assessment Request",
    consultation: "New Strategy Consultation Booking",
    readiness: "Funding Readiness Assessment Report"
  },

  // Autoresponse templates sent back to the prospect
  autoresponse: {
    contact: "Thank you for requesting a Strategic Funding Assessment from OPIVAMP GRANTS. Peter Oyedemi and our advisory team have received your organizational details and will provide an initial fit evaluation within 24 business hours.",
    consultation: "Thank you for scheduling a strategy consultation with OPIVAMP GRANTS. Peter Oyedemi has received your requested date, time, and project notes. We will review your submission and email your direct video meeting access link within 1 business day.",
    readiness: "Thank you for assessing your funding readiness with OPIVAMP GRANTS. Your full scorecard breakdown and priority preparation recommendations have been logged."
  },

  // Helper to get the submission endpoint
  getEndpoint: function() {
    return `https://formsubmit.co/ajax/${encodeURIComponent(this.recipientEmail.trim())}`;
  }
};
