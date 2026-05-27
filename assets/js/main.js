/* APA Prep Academy - Main JS Utilities */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking a nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  // Header Scroll Effect
  const header = document.querySelector('header.main-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.style.padding = '5px 0';
        header.style.boxShadow = 'var(--shadow-md)';
      } else {
        header.style.padding = '0';
        header.style.boxShadow = 'var(--shadow-sm)';
      }
    });
  }

  // Form Validation & Submission Handling
  const inquiryForm = document.getElementById('inquiryForm');
  const contactForm = document.getElementById('contactForm');

  if (inquiryForm) {
    const parentPanel = inquiryForm.closest('.contact-form-panel');
    const formWrapper = parentPanel ? parentPanel.querySelector('.form-wrapper') : null;
    const successWrapper = parentPanel ? parentPanel.querySelector('.success-wrapper') : null;
    const successEmail = successWrapper ? successWrapper.querySelector('#successEmailDisplay') : null;
    const backBtn = successWrapper ? successWrapper.querySelector('.btn-back-to-form') : null;
    const submitBtn = inquiryForm.querySelector('button[type="submit"]');

    inquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const parentName = document.getElementById('parentName').value.trim();
      const parentPhone = document.getElementById('parentPhone').value.trim();
      const parentEmail = document.getElementById('parentEmail').value.trim();
      const childName = document.getElementById('childName').value.trim();
      const childAge = document.getElementById('childAge').value;
      const startDate = document.getElementById('startDate').value;
      const notes = document.getElementById('notes').value.trim();
      const website = document.getElementById('inquiryHoney').value;

      if (!parentName || !parentPhone || !parentEmail || !childAge || !startDate) {
        showToast('Please fill out all required fields.', 'error');
        return;
      }

      // Client-side email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(parentEmail)) {
        showToast('Please enter a valid email address.', 'error');
        return;
      }

      try {
        setFormLoadingState(inquiryForm, submitBtn, true, 'Submitting waitlist...');

        const response = await fetch('/api/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            formType: 'inquiry',
            parentName,
            parentPhone,
            parentEmail,
            childName,
            childAge,
            startDate,
            notes,
            website
          })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          showToast('Inquiry submitted successfully!', 'success');
          
          if (successEmail) {
            successEmail.textContent = parentEmail;
          }
          
          inquiryForm.reset();

          if (formWrapper && successWrapper) {
            formWrapper.style.display = 'none';
            successWrapper.style.display = 'block';
            successWrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        } else {
          showToast(result.error || 'An error occurred during submission.', 'error');
        }
      } catch (error) {
        console.error('Waitlist submission error:', error);
        showToast('Unable to connect to the server. Please try again later.', 'error');
      } finally {
        setFormLoadingState(inquiryForm, submitBtn, false, 'Submit Waitlist Inquiry');
      }
    });

    if (backBtn && formWrapper && successWrapper) {
      backBtn.addEventListener('click', () => {
        successWrapper.style.display = 'none';
        formWrapper.style.display = 'block';
      });
    }
  }

  if (contactForm) {
    const parentPanel = contactForm.closest('.contact-form-panel');
    const formWrapper = parentPanel ? parentPanel.querySelector('.form-wrapper') : null;
    const successWrapper = parentPanel ? parentPanel.querySelector('.success-wrapper') : null;
    const successEmail = successWrapper ? successWrapper.querySelector('#successEmailDisplay') : null;
    const backBtn = successWrapper ? successWrapper.querySelector('.btn-back-to-form') : null;
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('contactName').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const phone = document.getElementById('contactPhone').value.trim();
      const subject = document.getElementById('contactSubject').value.trim();
      const message = document.getElementById('contactMessage').value.trim();
      const website = document.getElementById('contactHoney').value;

      if (!name || !email || !subject || !message) {
        showToast('Please fill out all required fields.', 'error');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address.', 'error');
        return;
      }

      try {
        setFormLoadingState(contactForm, submitBtn, true, 'Sending Message...');

        const response = await fetch('/api/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            formType: 'contact',
            name,
            email,
            phone,
            subject,
            message,
            website
          })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          showToast('Message sent successfully!', 'success');
          
          if (successEmail) {
            successEmail.textContent = email;
          }

          contactForm.reset();

          if (formWrapper && successWrapper) {
            formWrapper.style.display = 'none';
            successWrapper.style.display = 'block';
            successWrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        } else {
          showToast(result.error || 'An error occurred during submission.', 'error');
        }
      } catch (error) {
        console.error('Contact submission error:', error);
        showToast('Unable to connect to the server. Please try again later.', 'error');
      } finally {
        setFormLoadingState(contactForm, submitBtn, false, 'Send Message');
      }
    });

    if (backBtn && formWrapper && successWrapper) {
      backBtn.addEventListener('click', () => {
        successWrapper.style.display = 'none';
        formWrapper.style.display = 'block';
      });
    }
  }

  // Helper to toggle form loading states
  function setFormLoadingState(form, button, isLoading, buttonText) {
    const inputs = form.querySelectorAll('input, select, textarea, button');
    
    inputs.forEach(input => {
      input.disabled = isLoading;
    });

    if (button) {
      if (isLoading) {
        button.classList.add('btn-loading');
        button.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i> ${buttonText}`;
      } else {
        button.classList.remove('btn-loading');
        button.innerHTML = buttonText;
      }
    }
  }

  // Helper function to show a custom premium toast notification
  function showToast(message, type = 'success') {
    // Check if toast element exists
    let toast = document.querySelector('.toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-notification';
      document.body.appendChild(toast);
    }

    // Set colors & icons based on type
    if (type === 'error') {
      toast.style.borderLeftColor = '#E53E3E';
      toast.innerHTML = `<i class="fas fa-exclamation-circle" style="color: #E53E3E"></i> <span>${message}</span>`;
    } else {
      toast.style.borderLeftColor = 'var(--gold-primary)';
      toast.innerHTML = `<i class="fas fa-check-circle" style="color: var(--gold-primary)"></i> <span>${message}</span>`;
    }

    // Slide in
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);

    // Slide out after 5 seconds
    setTimeout(() => {
      toast.classList.remove('show');
    }, 5000);
  }

  // Scroll Reveal Animation Observer
  const revealElements = document.querySelectorAll('.program-highlight-card, .academy-badge-item, .program-full-card, .payment-card, .about-highlight-box, .contact-info-panel, .contact-form-panel');
  
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(element => {
      // Set initial styles for animation
      element.style.opacity = '0';
      element.style.transform = 'translateY(30px)';
      element.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      revealObserver.observe(element);
    });
  }
});
