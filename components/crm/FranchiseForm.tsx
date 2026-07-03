'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast, Toaster } from 'react-hot-toast'
import Image from 'next/image'
import { useStateCity } from '@/components/crm/useStateCity'
import { SearchableSelect, SearchableSelectOrCreate } from '@/components/crm/SearchableSelect'
import { SiteFooter } from '@/components/crm/SiteFooter'
import { submitCrmLead } from '@/components/crm/submitCrmLead'
import styles from './FranchiseForm.module.css'

interface FormData {
  fullName: string
  mobile: string
  email: string
  city: string
  state: string
  preferredCentreLocation: string
  franchiseType?: string
  investmentRange?: string
  expectedStartDate?: string
  comments?: string
}

const franchiseTypes = [
  { value: 'preschool', label: 'Preschool' },
  { value: 'daycare', label: 'Daycare' },
  { value: 'learning_center', label: 'Learning Center' },
]

const investmentRanges = [
  '10-20 Lakhs',
  '20-30 Lakhs',
  '30-50 Lakhs',
  '50-75 Lakhs',
  '75 Lakhs - 1 Crore',
  'Above 1 Crore',
]

export default function FranchiseForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { states, stateCity, loading: stateCityLoading, error: stateCityError } = useStateCity()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>()

  const selectedState = watch('state')

  const onSubmit = async (data: FormData) => {
    const mobile = data.mobile?.trim().replace(/\D/g, '').slice(-10) ?? ''
    if (mobile.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number.')
      return
    }

    setIsSubmitting(true)
    try {
      await submitCrmLead('web', {
        fullName: data.fullName?.trim(),
        mobile,
        email: data.email?.trim(),
        city: data.city?.trim(),
        state: data.state?.trim(),
        preferredCentreLocation: data.preferredCentreLocation?.trim(),
        franchiseType: data.franchiseType?.trim() || undefined,
        investmentRange: data.investmentRange?.trim() || undefined,
        expectedStartDate: data.expectedStartDate?.trim() || undefined,
        comments: data.comments?.trim() || undefined,
      })
      setSubmitted(true)
      toast.success('Thank you! We\'ve received your details and will be in touch.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit form.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: 'url(/crm/form-background.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#87CEEB',
      }}
    >
      <Toaster position="top-center" />
      {/* Soft overlay so form card pops */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-900/10 via-transparent to-sky-900/20 pointer-events-none" aria-hidden />

      <div className="relative z-10 w-full px-4 pt-6 pb-4 sm:pt-8 sm:pb-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">
          {/* Left: Logo + tagline */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-5 pt-0">
            <Image
              src="/crm/logo.png"
              alt="T.I.M.E. Kids - the pre-school that cares"
              width={280}
              height={140}
              priority
              unoptimized
              className="h-[120px] sm:h-[140px] w-auto object-contain block drop-shadow-lg"
            />
            <h1 className="text-2xl sm:text-3xl lg:text-[2.25rem] xl:text-5xl font-extrabold text-white drop-shadow-md max-w-lg leading-tight">
              Join India&apos;s trusted preschool family. Start your franchise journey today.
            </h1>
          </div>

          {/* Right: Form Card */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/60 p-4 sm:p-6 transition-shadow duration-300 max-w-lg lg:max-w-none lg:justify-self-end">
            <div className="text-center mb-4">
              <div className={styles.badge}>
                <h1>FRANCHISE ENQUIRY FORM</h1>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">Start Your Own Business Now!</p>
            </div>

            {submitted ? (
              <div className="text-center space-y-6 py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 text-4xl mb-4">✓</div>
                <h3 className="text-xl font-bold text-gray-900">Thank you!</h3>
                <p className="text-gray-600 max-w-sm mx-auto">We&apos;ve received your details. Our team will get in touch with you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('fullName', { required: 'Full name is required' })}
                    className={styles.input}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    {...register('mobile', {
                      required: 'Mobile number is required',
                      pattern: { value: /^[6-9]\d{9}$/, message: 'Please enter a valid 10-digit mobile number' },
                    })}
                    className={styles.input}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                  />
                  {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Please enter a valid email address' },
                    })}
                    className={styles.input}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    {stateCityLoading ? (
                      <div className={styles.select} style={{ background: '#f3f4f6', color: '#6b7280' }}>Loading states...</div>
                    ) : stateCityError ? (
                      <div className="text-red-500 text-sm">{stateCityError}</div>
                    ) : (
                      <Controller
                        name="state"
                        control={control}
                        rules={{ required: 'State is required' }}
                        render={({ field }) => (
                          <SearchableSelect
                            options={states.map((s) => ({ value: s, label: s }))}
                            value={field.value}
                            onChange={(v) => { field.onChange(v); setValue('city', '') }}
                            placeholder="Select State"
                            aria-label="State"
                          />
                        )}
                      />
                    )}
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    {stateCityLoading ? (
                      <div className={styles.input} style={{ background: '#f3f4f6', color: '#6b7280' }}>Loading cities...</div>
                    ) : selectedState && stateCity[selectedState]?.length ? (
                      <Controller
                        name="city"
                        control={control}
                        rules={{ required: 'City is required' }}
                        render={({ field }) => (
                          <SearchableSelect
                            options={stateCity[selectedState].map((c) => ({ value: c, label: c }))}
                            value={field.value}
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
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Enter your city"
                            aria-label="City"
                          />
                        )}
                      />
                    )}
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Preferred Centre Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('preferredCentreLocation', { required: 'Preferred centre location is required' })}
                    className={styles.input}
                    placeholder="Enter preferred location"
                  />
                  {errors.preferredCentreLocation && (
                    <p className="text-red-500 text-sm mt-1">{errors.preferredCentreLocation.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Franchise Type</label>
                    <select {...register('franchiseType')} className={styles.select}>
                      <option value="">Select Type</option>
                      {franchiseTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Investment Range</label>
                    <select {...register('investmentRange')} className={styles.select}>
                      <option value="">Select Range</option>
                      {investmentRanges.map((range) => (
                        <option key={range} value={range}>{range}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Expected Start Date</label>
                  <input type="date" {...register('expectedStartDate')} className={styles.input} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Comments / Questions</label>
                  <textarea {...register('comments')} className={styles.input} rows={3} placeholder="Any additional information..." />
                </div>

                <div className="sticky bottom-4 left-0 right-0 z-10 pt-3">
                  <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <SiteFooter className="text-white/95 drop-shadow-md" />
    </div>
  )
}
