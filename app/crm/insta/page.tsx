'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useStateCity } from '@/components/crm/useStateCity'
import { SearchableSelect, SearchableSelectOrCreate } from '@/components/crm/SearchableSelect'
import { SiteFooter } from '@/components/crm/SiteFooter'
import { submitCrmLead } from '@/components/crm/submitCrmLead'
import styles from './Instagram.module.css'

const FRANCHISE_TYPES = [
  { value: 'preschool', label: 'Preschool' },
  { value: 'daycare', label: 'Daycare' },
  { value: 'learning_center', label: 'Learning Center' },
]

const INVESTMENT_RANGES = [
  '10-20 Lakhs',
  '20-30 Lakhs',
  '30-50 Lakhs',
  '50-75 Lakhs',
  '75 Lakhs - 1 Crore',
  'Above 1 Crore',
]

export default function InstagramPage() {
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { states, stateCity, loading: stateCityLoading } = useStateCity()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const fd = new FormData(form)
    const name = (fd.get('name') as string)?.trim()
    const email = (fd.get('email') as string)?.trim()
    const phone = (fd.get('phone') as string)?.trim().replace(/\D/g, '').slice(-10)
    const preferredCentreLocation = (fd.get('preferredCentreLocation') as string)?.trim()
    const franchiseType = (fd.get('franchiseType') as string)?.trim()
    const investmentRange = (fd.get('investmentRange') as string)?.trim()
    const expectedStartDate = (fd.get('expectedStartDate') as string)?.trim()

    if (!name || !email || !phone) {
      alert('Please fill name, email and phone.')
      return
    }
    if (phone.length !== 10) {
      alert('Please enter a valid 10-digit mobile number.')
      return
    }
    if (!state || !city) {
      alert('Please select state and city.')
      return
    }

    setSubmitting(true)
    try {
      await submitCrmLead('insta', {
        fullName: name,
        email,
        mobile: phone,
        state,
        city,
        preferredCentreLocation: preferredCentreLocation || city || 'Not specified',
        franchiseType: franchiseType || undefined,
        investmentRange: investmentRange || undefined,
        expectedStartDate: expectedStartDate || undefined,
      })
      alert('Thank you! We\'ve received your enquiry. Our team will contact you shortly.')
      form.reset()
      setState('')
      setCity('')
    } catch (err) {
      alert(err instanceof Error ? `Could not save: ${err.message}` : 'Oops! Something went wrong. Please try again or call us! 🧸')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.background} />
      <section className={styles.heroSection}>
        <div className={styles.heroLayout}>
          {/* Left: logo + headline */}
          <div className={styles.contentCol}>
            <div className={styles.logoRow}>
              <Link href="/" className={styles.logoWrap}>
                <Image
                  src="/crm/logo.png"
                  className={styles.logo}
                  alt="T.I.M.E. Kids Logo"
                  width={220}
                  height={100}
                  priority
                  unoptimized
                />
              </Link>
            </div>
            <div className={styles.textContent}>
              <h1 className={styles.headline}>Join India&apos;s trusted preschool family. Start your franchise journey today.</h1>
            </div>
          </div>

          {/* Right: form card */}
          <div className={styles.formCol}>
            <div className={styles.formCard}>
              <div className={styles.formHeader}>
                <h3>Franchise Enquiry Form</h3>
              </div>
              <form onSubmit={handleSubmit}>
                <label htmlFor="ig-name">Full Name *</label>
                <input id="ig-name" name="name" required placeholder="What should we call you?" />

                <label htmlFor="ig-email">Email *</label>
                <input id="ig-email" name="email" type="email" required placeholder="Your email" />

                <label htmlFor="ig-phone">Phone number *</label>
                <div className={styles.phoneGroup}>
                  <div className={styles.phonePrefix}>+91-</div>
                  <input
                    id="ig-phone"
                    name="phone"
                    required
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    placeholder="10-digit number"
                    title="Enter 10-digit mobile number"
                    onInput={(e) => {
                      (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 10)
                    }}
                  />
                </div>

                <input type="hidden" name="state" value={state} />
                <input type="hidden" name="city" value={city} />
                <div className={styles.formRow}>
                  <div>
                    <label htmlFor="ig-state">State *</label>
                    {stateCityLoading ? (
                      <div className={styles.input} style={{ color: '#888' }}>Loading states...</div>
                    ) : (
                      <SearchableSelect
                        options={states.map((s) => ({ value: s, label: s }))}
                        value={state}
                        onChange={(v) => { setState(v); setCity('') }}
                        placeholder="Pick your state"
                        aria-label="State"
                      />
                    )}
                  </div>
                  <div>
                    <label htmlFor="ig-city">City *</label>
                    {stateCityLoading ? (
                      <div className={styles.input} style={{ color: '#888' }}>Loading cities...</div>
                    ) : stateCity[state]?.length ? (
                      <SearchableSelect
                        options={stateCity[state].map((c) => ({ value: c, label: c }))}
                        value={city}
                        onChange={setCity}
                        placeholder="Pick your city"
                        aria-label="City"
                      />
                    ) : (
                      <SearchableSelectOrCreate
                        options={[]}
                        value={city}
                        onChange={setCity}
                        placeholder="Enter your city"
                        aria-label="City"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="ig-preferred">Preferred Centre Location *</label>
                  <input
                    id="ig-preferred"
                    name="preferredCentreLocation"
                    type="text"
                    required
                    placeholder="Enter preferred location"
                  />
                </div>

                <div className={styles.formRow}>
                  <div>
                    <label htmlFor="ig-franchise">Franchise Type</label>
                    <select id="ig-franchise" name="franchiseType">
                      <option value="">Select Type</option>
                      {FRANCHISE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="ig-investment">Investment Range</label>
                    <select id="ig-investment" name="investmentRange">
                      <option value="">Select Range</option>
                      {INVESTMENT_RANGES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="ig-date">Expected Start Date</label>
                  <input
                    id="ig-date"
                    name="expectedStartDate"
                    type="date"
                    placeholder="mm/dd/yyyy"
                  />
                </div>

                <button type="submit" disabled={submitting}>
                  <span>SUBMIT</span>
                  <span style={{ fontSize: '24px' }}>🚀</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter className="text-white/90" />
    </div>
  )
}
