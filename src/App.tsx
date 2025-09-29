import React, { useEffect, useRef, useState } from 'react';

function App() {
  const backgroundAnimationRef = useRef<HTMLDivElement>(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '' });
  const [errors, setErrors] = useState({ name: false, email: false });
  const [showSuccess, setShowSuccess] = useState(false);

  // Generate animated stars/orbs
  const createStars = () => {
    const container = backgroundAnimationRef.current;
    if (!container) return;
    
    const starCount = 15;
    
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      
      // Random size between 2-6px
      const size = Math.random() * 4 + 2;
      star.style.width = size + 'px';
      star.style.height = size + 'px';
      
      // Random position
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      
      // Random animation delay and duration
      star.style.animationDelay = Math.random() * 20 + 's';
      star.style.animationDuration = (20 + Math.random() * 10) + 's';
      
      container.appendChild(star);
    }
  };

  // Initialize stars on load
  useEffect(() => {
    createStars();
  }, []);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors on input
    if (name === 'fullName') {
      setErrors(prev => ({ ...prev, name: false }));
    } else if (name === 'email') {
      setErrors(prev => ({ ...prev, email: false }));
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let isValid = true;
    const newErrors = { name: false, email: false };
    
    // Validate name
    if (formData.fullName.trim().length < 2) {
      newErrors.name = true;
      isValid = false;
    }
    
    // Validate email
    if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = true;
      isValid = false;
    }
    
    setErrors(newErrors);
    
    if (isValid) {
      // Reset form immediately
      setFormData({ fullName: '', email: '' });
      
      // Show success message after 2 seconds
      setTimeout(() => {
        setShowSuccess(true);
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
      }, 300);
      
      // Send data to webhook in background (fire and forget)
      fetch('https://n8n.loreo.app/webhook/JoinWaitList', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.fullName.trim(),
          email: formData.email.trim(),
          timestamp: new Date().toISOString()
        })
      }).then(response => {
        if (response.ok) {
          console.log('✅ Successfully submitted to webhook');
        } else {
          console.error('❌ Failed to submit form:', response.statusText);
        }
      }).catch(error => {
        console.error('❌ Error submitting form:', error);
      });
    }
  };

  // Smooth scroll for anchor links
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === '#' || href === '#privacy') {
      return;
    }
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Fade effect on scroll
  useEffect(() => {
    let ticking = false;
    
    const updateScrollEffects = () => {
      const scrolled = window.pageYOffset;
      const heroContent = document.querySelector('.hero-content') as HTMLElement;
      const heroSection = document.querySelector('.hero') as HTMLElement;
      
      if (heroContent && heroSection) {
        // Calculate fade based on scroll position
        const heroHeight = heroSection.offsetHeight;
        const fadeStart = heroHeight * 0.2; // Start fading at 20% of hero height
        const fadeEnd = heroHeight * 0.8; // Complete fade at 80% of hero height
        
        let opacity = 1;
        if (scrolled > fadeStart) {
          opacity = Math.max(0, 1 - ((scrolled - fadeStart) / (fadeEnd - fadeStart)));
        }
        
        // Apply opacity without transform to prevent overlap
        heroContent.style.opacity = opacity.toString();
        
        // Optional: slight scale effect for depth without movement
        const scale = 1 + (scrolled * 0.0001);
        heroContent.style.transform = `scale(${Math.min(scale, 1.1)})`;
      }
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollEffects);
        ticking = true;
      }
    };

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
      window.addEventListener('scroll', requestTick);
      return () => window.removeEventListener('scroll', requestTick);
    }
  }, []);

  // Handle modal
  const openPrivacyModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPrivacyModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closePrivacyModal = () => {
    setShowPrivacyModal(false);
    document.body.style.overflow = '';
  };

  // Handle escape key and outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showPrivacyModal) {
        closePrivacyModal();
      }
    };

    const handleOutsideClick = (e: MouseEvent) => {
      if (showPrivacyModal && (e.target as HTMLElement).classList.contains('modal')) {
        closePrivacyModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [showPrivacyModal]);

  return (
    <div>
      {/* Animated Background */}
      <div className="background-animation" ref={backgroundAnimationRef}></div>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="logo">LOREO</h1>
            <p className="tagline">Stories that feel alive, every night.</p>
            <p className="subheading">Personalized bedtime stories, narrated in your voice.</p>
            <a href="#waitlist" className="btn-primary" onClick={(e) => handleSmoothScroll(e, '#waitlist')}>
              <span className="btn-text">Reserve my Story</span>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Magic in Every Story</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <h3 className="feature-title">Personalization</h3>
              <p className="feature-description">Every story adapts to your child's world.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎤</div>
              <h3 className="feature-title">Voice Narration</h3>
              <p className="feature-description">Bring stories to life with voices of their loved ones.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌟</div>
              <h3 className="feature-title">Variety</h3>
              <p className="feature-description">Countless themes, toys, and genres to choose from.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💝</div>
              <h3 className="feature-title">Emotional Bond</h3>
              <p className="feature-description">Every bedtime turns into a magical moment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="waitlist" id="waitlist">
        <div className="container">
          <div className="waitlist-card">
            <div className="waitlist-content">
              <h2 className="waitlist-title">Be First to Experience Magic</h2>
              <p className="waitlist-subtitle">Join our waitlist for early access</p>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <input 
                    type="text" 
                    name="fullName" 
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Name" 
                    required
                    className={errors.name ? 'error' : ''}
                  />
                  <div className="error-message" style={{ display: errors.name ? 'block' : 'none' }}>
                    Please enter your name
                  </div>
                </div>
                <div className="form-group">
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email" 
                    required
                    className={errors.email ? 'error' : ''}
                  />
                  <div className="error-message" style={{ display: errors.email ? 'block' : 'none' }}>
                    Please enter a valid email address
                  </div>
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                  <span className="btn-text">Reserve my Story</span>
                </button>
              </form>
              <div className="success-message" style={{ display: showSuccess ? 'block' : 'none' }}>
                🎉 You're on the list! We'll contact you soon.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-content">
            <div className="footer-links">
              <a href="#" aria-label="Privacy Policy" onClick={openPrivacyModal}>Privacy Policy</a>
            </div>
            <a href="mailto:hello@loreo.app" className="footer-email">hello@loreo.app</a>
            <p className="footer-text">Made with ❤️ • © 2025 LOREO</p>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      <div className={`modal ${showPrivacyModal ? 'show' : ''}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">Privacy Policy</h2>
            <button className="close-button" onClick={closePrivacyModal}>&times;</button>
          </div>
          <div className="modal-body">
            <p><strong>Last Updated: January 2025</strong></p>
            
            <p>LOREO ("we," "our," or "us") is committed to protecting the privacy of children and their families. This Privacy Policy explains how we collect, use, and safeguard information when you use our personalized bedtime storytelling application.</p>

            <h3>1. Information We Collect</h3>
            <p>We collect minimal information necessary to provide our services:</p>
            <p>• <strong>Account Information:</strong> Parent's name and email address for account creation and communication<br/>
            • <strong>Child Information:</strong> Child's first name and age (no last names or identifying details)<br/>
            • <strong>Voice Data:</strong> Voice recordings provided by parents for story narration<br/>
            • <strong>Story Preferences:</strong> Themes, characters, and settings selected for personalization</p>

            <h3>2. How We Use Information</h3>
            <p>We use collected information solely to:</p>
            <p>• Create personalized bedtime stories for your child<br/>
            • Generate voice narration using parent-provided recordings<br/>
            • Save story preferences and favorites<br/>
            • Send important updates about the service<br/>
            • Improve our storytelling algorithms and user experience</p>

            <h3>3. Data Protection for Children</h3>
            <p>We take children's privacy seriously:</p>
            <p>• We comply with COPPA (Children's Online Privacy Protection Act) requirements<br/>
            • We never collect more information than necessary<br/>
            • Children cannot share personal information publicly<br/>
            • Voice recordings are encrypted and used only for story narration<br/>
            • We never sell or share children's information with third parties</p>

            <h3>4. Data Storage and Security</h3>
            <p>• All data is encrypted in transit and at rest<br/>
            • Voice recordings are processed securely and deleted after 90 days unless saved by parents<br/>
            • We use industry-standard security measures to protect against unauthorized access<br/>
            • Data is stored on secure servers with regular security audits</p>

            <h3>5. Parental Controls</h3>
            <p>Parents have full control over their family's data:</p>
            <p>• Access and review all collected information<br/>
            • Update or correct any information<br/>
            • Delete voice recordings at any time<br/>
            • Request complete account deletion<br/>
            • Control story sharing and saving preferences</p>

            <h3>6. Third-Party Services</h3>
            <p>We use limited third-party services:</p>
            <p>• Cloud hosting for secure data storage<br/>
            • Payment processing (parent information only)<br/>
            • Analytics (anonymized and aggregated data only)<br/>
            These services are carefully vetted and comply with our privacy standards.</p>

            <h3>7. Data Retention</h3>
            <p>• Account information is retained while your account is active<br/>
            • Voice recordings are auto-deleted after 90 days unless saved<br/>
            • Stories are kept in your library unless manually deleted<br/>
            • Upon account deletion, all data is permanently removed within 30 days</p>

            <h3>8. Your Rights</h3>
            <p>You have the right to:</p>
            <p>• Access your personal information<br/>
            • Request corrections to inaccurate data<br/>
            • Delete your account and all associated data<br/>
            • Opt-out of non-essential communications<br/>
            • Export your stories and preferences</p>

            <h3>9. Contact Us</h3>
            <p>If you have questions or concerns about this Privacy Policy or our practices, please contact us at:</p>
            <p>Email: hello@loreo.app<br/>
            Address: LOREO Privacy Team<br/>
            [Address will be provided when available]</p>

            <h3>10. Changes to This Policy</h3>
            <p>We may update this Privacy Policy to reflect changes in our practices or for legal reasons. We will notify you of any material changes via email and within the app.</p>

            <p><strong>By using LOREO, you agree to the terms outlined in this Privacy Policy.</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;