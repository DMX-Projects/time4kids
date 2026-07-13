'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useForm, Controller } from 'react-hook-form'
import { toast, Toaster } from 'react-hot-toast'
import { useStateCity } from '@/components/crm/useStateCity'
import { SearchableSelect, SearchableSelectOrCreate } from '@/components/crm/SearchableSelect'
import { SiteFooter } from '@/components/crm/SiteFooter'
import { submitCrmLead } from '@/components/crm/submitCrmLead'
import styles from './Facebook.module.css'

interface FormData {
  name: string
  mobile: string
  email: string
  city: string
  state: string
  preferredCentreLocation: string
  franchiseType?: string
  investmentRange?: string
  expectedStartDate?: string
}

// Removed FRANCHISE_TYPES

const INVESTMENT_RANGES = [
  '10-20 Lakhs',
  '20-30 Lakhs',
  '30-50 Lakhs',
  '50-75 Lakhs',
  '75 Lakhs - 1 Crore',
  'Above 1 Crore',
]

export default function FacebookPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { states, stateCity, loading: stateCityLoading } = useStateCity()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({ mode: 'onTouched' })

  const selectedState = watch('state')

  const onSubmit = async (data: FormData) => {
    const mobile = data.mobile?.trim().replace(/\D/g, '').slice(-10) ?? ''
    if (mobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number.')
      return
    }

    setIsSubmitting(true)
    try {
      await submitCrmLead('fb', {
        fullName: data.name?.trim(),
        email: data.email?.trim(),
        mobile,
        state: data.state?.trim(),
        city: data.city?.trim(),
        preferredCentreLocation: data.preferredCentreLocation?.trim() || data.city?.trim() || 'Not specified',
        franchiseType: data.franchiseType?.trim() || undefined,
        investmentRange: data.investmentRange?.trim() || undefined,
        expectedStartDate: data.expectedStartDate?.trim() || undefined,
      })
      toast.success('Thank you! We\'ve received your enquiry. Our team will contact you shortly.')
      reset()
    } catch (err) {
      toast.error(err instanceof Error ? `Could not save: ${err.message}` : 'Oops! Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.background} />
      <header className={styles.topHeader}>
        <Link href="/" className={styles.logoLink}>
          <div className={styles.logoWrap}>
            <Image
              src="/crm/logo.png"
              className={styles.logo}
              alt="T.I.M.E. Kids Logo"
              width={220}
              height={110}
              priority
              unoptimized
            />
          </div>
        </Link>

        <h1 className={styles.headline}>Join India&apos;s trusted preschool family. Start your franchise journey today.</h1>
      </header>

      <main className={styles.formSection}>
        <div className={styles.formWrapper}>
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <h3 style={{ color: '#1877f2' }}>Franchise Enquiry Form</h3>
            </div>
            <Toaster position="top-center" />
            <form onSubmit={handleSubmit(onSubmit)}>
              <label htmlFor="fb-name">Full Name *</label>
              <input 
                id="fb-name" 
                {...register('name', { required: 'Full name is required', minLength: { value: 3, message: 'Name must be at least 3 characters' } })} 
                placeholder="Enter Full Name" 
              />
              {errors.name && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px', marginBottom: '8px' }}>{errors.name.message}</p>}

              <label htmlFor="fb-email">Email Address *</label>
              <input 
                id="fb-email" 
                type="email" 
                {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Please enter a valid email address' } })} 
                placeholder="Enter Email Address" 
              />
              {errors.email && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px', marginBottom: '8px' }}>{errors.email.message}</p>}

              <label htmlFor="fb-phone">Mobile Number *</label>
              <div className={styles.phoneGroup}>
                <div className={styles.phonePrefix}>+91-</div>
                <input
                  id="fb-phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  {...register('mobile', { required: 'Mobile number is required', pattern: { value: /^[6-9]\d{9}$/, message: 'Please enter a valid 10-digit mobile number' } })}
                  placeholder="10-digit number"
                  title="Enter 10-digit mobile number"
                  onInput={(e) => {
                    const el = e.target as HTMLInputElement;
                    el.value = el.value.replace(/\D/g, '').slice(0, 10);
                  }}
                />
              </div>
              {errors.mobile && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px', marginBottom: '8px' }}>{errors.mobile.message}</p>}

              <div className={styles.formRow}>
                <div>
                  <label htmlFor="fb-state">State *</label>
                  {stateCityLoading ? (
                    <div className={styles.input} style={{ color: '#888' }}>Loading states...</div>
                  ) : (
                    <Controller
                      name="state"
                      control={control}
                      rules={{ required: 'State is required' }}
                      render={({ field }) => (
                        <SearchableSelect
                          options={states.map((s) => ({ value: s, label: s }))}
                          value={field.value || ''}
                          onChange={(v) => { field.onChange(v); setValue('city', '') }}
                          placeholder="Select State"
                          aria-label="State"
                        />
                      )}
                    />
                  )}
                  {errors.state && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px', marginBottom: '8px' }}>{errors.state.message}</p>}
                </div>
                <div>
                  <label htmlFor="fb-city">City *</label>
                  {stateCityLoading ? (
                    <div className={styles.input} style={{ color: '#888' }}>Loading cities...</div>
                  ) : selectedState && stateCity[selectedState]?.length ? (
                    <Controller
                      name="city"
                      control={control}
                      rules={{ required: 'City is required' }}
                      render={({ field }) => (
                        <SearchableSelect
                          options={stateCity[selectedState].map((c) => ({ value: c, label: c }))}
                          value={field.value || ''}
                          onChange={field.onChange}
                          placeholder="Select City"
                          aria-label="City"
                        />
                      )}
                    />
                  ) : (
                    <Controller
                      name="city"
                      control={control}
                      rules={{ required: 'City is required' }}
                      render={({ field }) => (
                        <SearchableSelectOrCreate
                          options={[]}
                          value={field.value || ''}
                          onChange={field.onChange}
                          placeholder="Enter your city"
                          aria-label="City"
                        />
                      )}
                    />
                  )}
                  {errors.city && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px', marginBottom: '8px' }}>{errors.city.message}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="fb-preferred">Preferred Centre Location *</label>
                <input
                  id="fb-preferred"
                  type="text"
                  {...register('preferredCentreLocation', { required: 'Preferred centre location is required' })}
                  placeholder="Enter preferred location"
                />
                {errors.preferredCentreLocation && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px', marginBottom: '8px' }}>{errors.preferredCentreLocation.message}</p>}
              </div>

              <div>
                <label htmlFor="fb-investment">Investment Range</label>
                <select id="fb-investment" {...register('investmentRange')}>
                  <option value="">Select Range</option>
                  {INVESTMENT_RANGES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="fb-date">Expected Start Date</label>
                <input
                  id="fb-date"
                  type="date"
                  {...register('expectedStartDate')}
                  placeholder="mm/dd/yyyy"
                />
              </div>

              <button type="submit" disabled={isSubmitting}>
                <span>{isSubmitting ? 'SUBMITTING...' : 'SUBMIT ENQUIRY'}</span>
                <span style={{ fontSize: '24px' }}>🚀</span>
              </button>
            </form>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
