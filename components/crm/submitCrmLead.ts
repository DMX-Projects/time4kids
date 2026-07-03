import { apiUrl } from '@/lib/api-client'

export type CrmSource = 'web' | 'fb' | 'insta'

export interface CrmLeadPayload {
  fullName: string
  mobile: string
  email?: string
  state?: string
  city?: string
  preferredCentreLocation?: string
  franchiseType?: string
  investmentRange?: string
  expectedStartDate?: string
  comments?: string
}

/** POST a CRM lead to the separate Django crm_leads table. */
export async function submitCrmLead(source: CrmSource, data: CrmLeadPayload): Promise<void> {
  const payload: Record<string, unknown> = {
    ...data,
    source,
  }

  if (typeof window !== 'undefined') {
    payload.landingPageUrl = window.location.href
    const params = new URLSearchParams(window.location.search)
    const utmSource = params.get('utm_source')
    const utmMedium = params.get('utm_medium')
    const utmCampaign = params.get('utm_campaign')
    payload.utmSource = utmSource || (source === 'fb' ? 'facebook' : source === 'insta' ? 'instagram' : 'website')
    if (utmMedium) payload.utmMedium = utmMedium
    if (utmCampaign) payload.utmCampaign = utmCampaign
  }

  const res = await fetch(apiUrl('/enquiries/crm-leads/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({} as Record<string, unknown>))
    const message =
      (err.detail as string) ||
      (Array.isArray(err.mobile) ? (err.mobile[0] as string) : '') ||
      (Array.isArray(err.full_name) ? (err.full_name[0] as string) : '') ||
      'Unable to submit enquiry.'
    throw new Error(message)
  }
}
