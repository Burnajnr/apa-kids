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
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Form fields
      const name = document.getElementById('parentName').value.trim();
      const phone = document.getElementById('parentPhone').value.trim();
      const email = document.getElementById('parentEmail').value.trim();
      const childAge = document.getElementById('childAge').value;
      const startDate = document.getElementById('startDate').value;

      if (!name || !phone || !email || !childAge || !startDate) {
        showToast('Please fill out all required fields.', 'error');
        return;
      }

      // Simulate API submit or Email delivery
      console.log('Sending Inquiry:', { name, phone, email, childAge, startDate });
      showToast('Thank you! Your waitlist inquiry has been received. We will contact you soon.', 'success');
      inquiryForm.reset();
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contactName').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const message = document.getElementById('contactMessage').value.trim();

      if (!name || !email || !message) {
        showToast('Please fill out all fields.', 'error');
        return;
      }

      // Simulate API submit or Email delivery
      console.log('Sending Message:', { name, email, message });
      showToast('Thank you! Your message has been sent successfully.', 'success');
      contactForm.reset();
    });
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
