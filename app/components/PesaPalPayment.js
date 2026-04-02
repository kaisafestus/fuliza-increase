'use client'

import { useState } from 'react'

export default function PesaPalPayment({ 
  package: pkg, 
  onSuccess, 
  onError, 
  onCancel 
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    name: '',
  })
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^(0|254|\+254)[0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/pesapal/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          package: pkg,
          phone: formData.phone,
          email: formData.email,
          name: formData.name,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment')
      }
      
      // Redirect to PesaPal payment page
      if (data.redirect_url) {
        window.location.href = data.redirect_url
      } else {
        throw new Error('No redirect URL received')
      }
    } catch (error) {
      console.error('Payment initiation error:', error)
      onError?.(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  return (
    <div className="pesapal-payment-modal">
      <div className="pesapal-payment-content">
        <div className="pesapal-payment-header">
          <h2>Complete Your Payment</h2>
          <button 
            className="pesapal-close-btn" 
            onClick={onCancel}
            disabled={loading}
          >
            ×
          </button>
        </div>
        
        <div className="pesapal-package-summary">
          <div className="pesapal-package-name">
            FULIZA {pkg.limit}
          </div>
          <div className="pesapal-package-fee">
            One-time fee: <strong>KSh {pkg.fee}</strong>
          </div>
          <div className="pesapal-package-limit">
            Limit increase: KSh {pkg.limit}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="pesapal-form">
          <div className="pesapal-form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              disabled={loading}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && (
              <span className="pesapal-error">{errors.name}</span>
            )}
          </div>
          
          <div className="pesapal-form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              disabled={loading}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && (
              <span className="pesapal-error">{errors.email}</span>
            )}
          </div>
          
          <div className="pesapal-form-group">
            <label htmlFor="phone">M-PESA Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="e.g., 0712345678"
              disabled={loading}
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && (
              <span className="pesapal-error">{errors.phone}</span>
            )}
            <span className="pesapal-hint">
              This is the phone number that will receive the M-PESA prompt
            </span>
          </div>
          
          <div className="pesapal-payment-methods">
            <div className="pesapal-method-title">Payment Methods</div>
            <div className="pesapal-methods">
              <div className="pesapal-method active">
                <span className="pesapal-method-icon">📱</span>
                <span>M-PESA</span>
              </div>
              <div className="pesapal-method">
                <span className="pesapal-method-icon">💳</span>
                <span>Card</span>
              </div>
              <div className="pesapal-method">
                <span className="pesapal-method-icon">🏦</span>
                <span>Bank</span>
              </div>
            </div>
          </div>
          
          <div className="pesapal-actions">
            <button
              type="button"
              className="pesapal-btn pesapal-btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="pesapal-btn pesapal-btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="pesapal-spinner"></span>
                  Processing...
                </>
              ) : (
                `Pay KSh ${pkg.fee}`
              )}
            </button>
          </div>
        </form>
        
        <div className="pesapal-footer">
          <div className="pesapal-secure">
            <span>🔒</span> Secure payment powered by PesaPal
          </div>
          <div className="pesapal-terms">
            By proceeding, you agree to our Terms of Service
          </div>
        </div>
      </div>
    </div>
  )
}
