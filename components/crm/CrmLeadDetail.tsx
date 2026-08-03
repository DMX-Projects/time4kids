'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/crmApi'
import { Toaster, toast } from 'react-hot-toast'
import { getWhatsAppUrl } from '@/lib/crmContactHelpers'
import { getCrmDashboardReturnHref, isSafeCrmReturnHref } from '@/lib/crmDashboardFilters'
import { utmCampaignDisplay, utmMediumDisplay, utmSourceDisplay, isFranchiseLead, isFranchiseLpGeoSource, crmPipelineForLead, expectedStartDisplay, isMetaInstantFormLead } from '@/lib/crmLeadKind'
import { useAuth } from '@/components/auth/AuthProvider'
import {
  isAgencyCrmEmail,
  isCampaignExternalViewerEmail,
  isRestrictedCrmViewerEmail,
} from '@/lib/crmCampaignAccess'
import { ChevronLeft } from 'lucide-react'

interface LeadTemplate {
  whatsapp: string
  emailSubject: string
  emailBody: string
}

const getTemplatesForLead = (lead: any): LeadTemplate => {
  const isFranchise = isFranchiseLead(lead)
  const isAdmission = lead.leadKind === 'enquiry' && lead.enquiryType === 'ADMISSION'
  const isCenterPage = lead.leadKind === 'enquiry' && lead.enquiryType === 'CONTACT'

  if (isFranchise) {
    return {
      whatsapp: 'Hi! I am from T.I.M.E. Kids. We received your franchise enquiry and would like to connect with you. When would be a good time to talk?',
      emailSubject: 'T.I.M.E. Kids – Follow-up on your franchise enquiry',
      emailBody: `Hi,

I'm following up on your franchise enquiry with T.I.M.E. Kids.

We'd like to discuss the opportunity with you. Please let us know a convenient time for a quick call.

Best regards,
T.I.M.E. Kids Team`,
    }
  }

  if (isAdmission) {
    return {
      whatsapp: 'Hi! I am from T.I.M.E. Kids. We received your preschool admission enquiry and would like to connect with you to discuss the details. When would be a good time to talk?',
      emailSubject: 'T.I.M.E. Kids Preschool – Follow-up on your admission enquiry',
      emailBody: `Hi,

I'm following up on your preschool admission enquiry with T.I.M.E. Kids.

We'd like to invite you and your child for a visit to our center and share the details. Please let us know a convenient time to connect.

Best regards,
T.I.M.E. Kids Team`,
    }
  }

  if (isCenterPage) {
    return {
      whatsapp: 'Hi! I am from T.I.M.E. Kids. We received your enquiry and would like to connect with you to assist. When would be a good time to talk?',
      emailSubject: 'T.I.M.E. Kids – Follow-up on your enquiry',
      emailBody: `Hi,

I'm following up on your enquiry with T.I.M.E. Kids.

We'd like to help answer any questions you have. Please let us know a convenient time for a quick call.

Best regards,
T.I.M.E. Kids Team`,
    }
  }

  return {
    whatsapp: 'Hi! I am from T.I.M.E. Kids. We saw that you registered interest via our online campaign. When would be a good time to talk?',
    emailSubject: 'T.I.M.E. Kids – Information regarding your inquiry',
    emailBody: `Hi,

I'm following up on your interest registered via our online campaign with T.I.M.E. Kids.

We'd like to connect and share more details with you. Please let us know a convenient time for a quick call.

Best regards,
T.I.M.E. Kids Team`,
  }
}

/** TKPL Zonal Managers + CRM Super Admins who may assign leads. */
const CRM_LEAD_ASSIGNER_EMAILS = new Set([
  'tejbal@timekidspreschools.com',
  'gaurav@timekidspreschools.com',
  'jyoti.mishra@timekidspreschools.com',
  'admin@timekids.com',
  'jayesh@time4education.com',
  'bethleena@timekidspreschools.com',
])

const toLocalDatetimeString = (dateStr: string | undefined | null) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const YYYY = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const DD = String(d.getDate()).padStart(2, '0');
  const HH = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${YYYY}-${MM}-${DD}T${HH}:${mm}`;
};

const formatLeadDateTime = (dateStr: string | undefined | null) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const STATUS_LABELS: Record<string, string> = {
  // Non-franchise specific
  untouched: 'Untouched',
  not_answering: 'Not answering',
  follow_up: 'Follow-up',
  visited_school: 'Visited the school',
  converted_admission: 'Converted to Admission',
  joined_competition: 'Joined competition',
  not_interested: 'Not Interested',
  wrong_enquiry: 'Wrong enquiry',

  // Franchise specific
  hot: 'Hot',
  warm: 'Warm',
  cold: 'Cold',
  converted_mou_signed: 'Converted – MOU',
  converted_agreement_signed: 'Converted – Agreement',
  join_later: 'Join Later',
  not_answering_calls: 'Not Answering Calls',
  interested: 'Interested',

  // Legacy mappings for display fallback
  new: 'Untouched',
  called: 'Not answering',
  contacted: 'Not answering',
  converted: 'Converted to Admission',
  dropped: 'Not Interested',
  meeting_scheduled: 'Visited the school',
}

const NON_FRANCHISE_OPTIONS = [
  'untouched',
  'not_answering',
  'wrong_enquiry',
  'not_interested',
  'follow_up',
  'joined_competition',
  'visited_school',
  'converted_admission',
]

const FRANCHISE_OPTIONS = [
  'untouched',
  'not_answering_calls',
  'follow_up',
  'join_later',
  'cold',
  'warm',
  'hot',
  'not_interested',
  'wrong_enquiry',
  'converted_mou_signed',
  'converted_agreement_signed',
]

const STATUS_COLORS: Record<string, string> = {
  untouched: 'bg-gray-100 text-gray-700 border border-gray-200',
  not_answering: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  follow_up: 'bg-blue-100 text-blue-800 border border-blue-200',
  visited_school: 'bg-teal-100 text-teal-800 border border-teal-200',
  converted_admission: 'bg-green-100 text-green-700 border border-green-200',
  joined_competition: 'bg-purple-100 text-purple-700 border border-purple-200',
  not_interested: 'bg-red-100 text-red-700 border border-red-200',
  wrong_enquiry: 'bg-orange-100 text-orange-700 border border-orange-200',

  hot: 'bg-red-100 text-red-700 border border-red-200',
  warm: 'bg-orange-100 text-orange-700 border border-orange-200',
  cold: 'bg-blue-50 text-blue-700 border border-blue-100',
  converted_mou_signed: 'bg-green-100 text-green-700 border border-green-200',
  converted_agreement_signed: 'bg-green-200 text-green-800 border border-green-300',
  join_later: 'bg-purple-100 text-purple-700 border border-purple-200',
  not_answering_calls: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  interested: 'bg-sky-100 text-sky-800 border border-sky-200',

  // Legacy mappings for display fallback
  new: 'bg-gray-100 text-gray-700 border border-gray-200',
  called: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  contacted: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  converted: 'bg-green-100 text-green-700 border border-green-200',
  dropped: 'bg-red-100 text-red-700 border border-red-200',
  meeting_scheduled: 'bg-teal-100 text-teal-800 border border-teal-200',
}
const SOURCE_OPTIONS = [
  'facebook', 'instagram', 'website', 'google_ads', 'referral', 'walk_in', 'other',
]

const SOURCE_LABELS: Record<string, string> = {
  contact: 'CenterPage',
  admission: 'Admission',
  landing: 'Paid Campaign',
  campaign: 'Paid Campaign',
  website: 'Website',
  facebook: 'Facebook',
  instagram: 'Instagram',
  july_lp: 'BCWW_Google',
  july_meta: 'BCWW_Meta',
  lp_wb: 'Ants_Google',
  ants_meta: 'Ants_Meta',
  google: 'BCWW_Google',
  facebook_lead_ads: 'BCWW_Meta',
  youtube: 'YouTube',
}

function sourceLabel(source?: string) {
  if (!source) return '—'
  return SOURCE_LABELS[source] || source.replace(/_/g, ' ')
}

export default function LeadDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, logout } = useAuth()
  const [lead, setLead] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sendingDirectEmail, setSendingDirectEmail] = useState(false)
  const [emailComposeOpen, setEmailComposeOpen] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [whatsappComposeOpen, setWhatsappComposeOpen] = useState(false)
  const [whatsappMessage, setWhatsappMessage] = useState('')
  const [editForm, setEditForm] = useState<Record<string, string>>({})
  const [assignUsers, setAssignUsers] = useState<{ id: number; label: string }[]>([])
  const isCampaignReadonlyUser = isRestrictedCrmViewerEmail(user?.email)
  const isExternalCampaignViewer = isCampaignExternalViewerEmail(user?.email)
  const isAgencyUser = isAgencyCrmEmail(user?.email) || Boolean(lead?.agencyCommentOnly)
  // Agency / external / campaign viewers only — normal CRM logins keep full lead tools.
  const hideCrmOpsFields =
    isCampaignReadonlyUser ||
    isExternalCampaignViewer ||
    Boolean(lead?.campaignViewer)
  // Agency: comment box + History only (no status edit, WhatsApp, email, assignment).
  const showAgencyCommentHistory = isAgencyUser
  const showHistoryPanel = !hideCrmOpsFields || showAgencyCommentHistory
  const canAssignUsers = Boolean(
    lead?.canAssignUsers ||
      user?.canAssignUsers ||
      CRM_LEAD_ASSIGNER_EMAILS.has(String(user?.email || '').trim().toLowerCase()),
  ) && !hideCrmOpsFields

  useEffect(() => {
    loadLead()
  }, [params.id])

  useEffect(() => {
    if (lead) {
      setEditForm({
        fullName: lead.fullName ?? '',
        mobile: lead.mobile ?? '',
        email: lead.email ?? '',
        city: lead.city ?? '',
        state: lead.state ?? '',
        preferredCentreLocation: lead.preferredCentreLocation ?? '',
        franchiseType: lead.franchiseType ?? '',
        investmentRange: lead.investmentRange ?? '',
        expectedStartDate: lead.expectedStartDate ?? '',
        childAge: lead.childAge ?? '',
        source: lead.source ?? 'website',
        sourceOther: lead.sourceOther ?? '',
        newNote: '',
        status: lead.status ?? 'new',
        // Assignment is an explicit ZM action; never preselect a suggested/random manager.
        assignedUserId: '',
        meetingDate: toLocalDatetimeString(lead.meetingDate),
        nextFollowUpDate: toLocalDatetimeString(lead.nextFollowUpDate),
        meetingFixed: lead.meetingFixed ? '1' : '',
        meetingDone: lead.meetingDone ? '1' : '',
      })
    }
  }, [lead])

  useEffect(() => {
    if (!isCampaignReadonlyUser || !params.id) return
    const timer = window.setInterval(async () => {
      try {
        const response = await api.get(`/leads/${params.id}`)
        setLead(response.data)
      } catch {
        // Keep view-only screen stable; no toasts for background refresh failures.
      }
    }, 15000)
    return () => window.clearInterval(timer)
  }, [isCampaignReadonlyUser, params.id])

  useEffect(() => {
    if (!canAssignUsers || !lead) {
      setAssignUsers([])
      return
    }
    let cancelled = false
    const paramsQs = new URLSearchParams()
    paramsQs.set('forAssign', '1')
    const pipeline = crmPipelineForLead(lead)
    if (pipeline) paramsQs.set('pipeline', pipeline)
    if (lead.state) paramsQs.set('state', String(lead.state))
    // Meta Instant Forms have no city dropdown — map RMs by state only.
    if (isMetaInstantFormLead(lead)) {
      paramsQs.set('stateOnly', '1')
      if (lead.source) paramsQs.set('source', String(lead.source))
      if (lead.utmSource) paramsQs.set('utmSource', String(lead.utmSource))
    } else if (lead.city) {
      paramsQs.set('city', String(lead.city))
    }
    const qs = paramsQs.toString()
    api
      .get(`/users?${qs}`)
      .then((res) => {
        if (cancelled) return
        const list = Array.isArray(res.data?.users) ? res.data.users : []
        setAssignUsers(
          list.map((u: { id: number; label?: string; fullName?: string }) => ({
            id: u.id,
            label: u.label || u.fullName || `User ${u.id}`,
          })),
        )
      })
      .catch(() => {
        if (!cancelled) setAssignUsers([])
      })
    return () => {
      cancelled = true
    }
  }, [canAssignUsers, lead?.id, lead?.state, lead?.city, lead?.leadKind, lead?.enquiryType, lead?.source])

  const assignUserOptions = useMemo(() => {
    return assignUsers.map((u) => ({ value: String(u.id), label: u.label }))
  }, [assignUsers])

  const goBackToDashboard = () => {
    if (typeof window !== 'undefined') {
      // Ensure we always have something to restore even if `from` is missing.
      const from = new URLSearchParams(window.location.search).get('from')
      const fallback = getCrmDashboardReturnHref()
      const target = isSafeCrmReturnHref(from) ? from : fallback
      router.push(target)
      return
    }
    router.push(getCrmDashboardReturnHref())
  }

  const handleLogout = () => {
    logout()
    router.push('/crm-admin/login')
  }

  const loadLead = async () => {
    try {
      const response = await api.get(`/leads/${params.id}`)
      setLead(response.data)
    } catch (error) {
      toast.error('Failed to load lead details')
      goBackToDashboard()
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    const prevUser = lead.assignedUserId != null ? String(lead.assignedUserId) : ''
    const nextUser = editForm.assignedUserId || ''
    if (!nextUser) {
      toast.error('Please select a user to assign.')
      return
    }
    if (nextUser === prevUser) {
      toast.error('This lead is already assigned to that user.')
      return
    }

    setSaving(true)
    try {
      const response = await api.patch(`/leads/${params.id}`, { assignedUserId: nextUser })
      toast.success('Lead assigned successfully!')
      // Prefer PATCH body — assignment already saved even if this lead leaves the
      // assigner's territory view (ZM/RM forwarded lead → their manager).
      if (response?.data) {
        setLead(response.data)
      }
      try {
        const refreshed = await api.get(`/leads/${params.id}`)
        setLead(refreshed.data)
      } catch {
        // Only if this login still cannot open the lead after assign.
        goBackToDashboard()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.response?.data?.detail || 'Failed to assign')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveStatus = async () => {
    const noteText = (editForm.newNote || '').trim()
    if (!noteText) {
      toast.error('Please enter a comment before updating status.')
      return
    }

    setSaving(true)
    try {
      await api.post(`/leads/${params.id}/notes`, {
        content: noteText,
        status: editForm.status,
      })

      await api.patch(`/leads/${params.id}`, {
        meetingDate: editForm.meetingDate ? new Date(editForm.meetingDate).toISOString() : null,
        nextFollowUpDate: editForm.nextFollowUpDate ? new Date(editForm.nextFollowUpDate).toISOString() : null,
        meetingFixed: Boolean(editForm.meetingFixed),
        meetingDone: Boolean(editForm.meetingDone),
        status: editForm.status,
      })

      toast.success(
        editForm.status !== lead.status
          ? 'Status updated successfully!'
          : 'Details saved successfully!',
      )
      setEditForm((f) => ({ ...f, newNote: '' }))
      loadLead()
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.response?.data?.detail || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleAddNote = async () => {
    if (!note.trim()) {
      toast.error('Please enter a comment')
      return
    }
    setSaving(true)
    try {
      await api.post(`/leads/${params.id}/notes`, { content: note.trim() })
      toast.success('Comment added')
      setNote('')
      loadLead()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || error.response?.data?.message || 'Failed to add comment')
    } finally {
      setSaving(false)
    }
  }

  const openWhatsAppCompose = () => {
    if (!lead?.mobile?.trim()) {
      toast.error('Lead has no mobile number')
      return
    }
    const templates = getTemplatesForLead(lead)
    setWhatsappMessage(templates.whatsapp)
    setWhatsappComposeOpen(true)
  }

  const handleOpenWhatsApp = async () => {
    if (!lead?.mobile?.trim()) {
      toast.error('Lead has no mobile number')
      return
    }
    if (!whatsappMessage.trim()) {
      toast.error('Message is required')
      return
    }
    const message = whatsappMessage.trim()
    try {
      await api.post('/leads/send-reminder', {
        leadId: params.id,
        channel: 'whatsapp',
        body: message,
      })
    } catch {
      // Still open WhatsApp even if history logging fails.
    }
    window.open(getWhatsAppUrl(lead.mobile, message), '_blank', 'noopener,noreferrer')
    setWhatsappComposeOpen(false)
    toast.success('WhatsApp opened — logged in History')
    loadLead()
  }

  const openEmailCompose = () => {
    if (!lead?.email?.trim()) {
      toast.error('Lead has no email address')
      return
    }
    const templates = getTemplatesForLead(lead)
    setEmailSubject(templates.emailSubject)
    setEmailBody(templates.emailBody)
    setEmailComposeOpen(true)
  }

  const handleDirectEmail = async () => {
    if (!lead?.email?.trim()) {
      toast.error('Lead has no email address')
      return
    }
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error('Subject and body are required')
      return
    }
    setSendingDirectEmail(true)
    try {
      await api.post('/leads/send-reminder', {
        leadId: params.id,
        channel: 'email',
        subject: emailSubject.trim(),
        body: emailBody.trim(),
      })
      toast.success('Email sent from franchise@timekidspreschools.com')
      setEmailComposeOpen(false)
      loadLead()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send email')
    } finally {
      setSendingDirectEmail(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!lead) {
    return <div className="min-h-screen flex items-center justify-center">Lead not found</div>
  }

  const isEditable =
    (lead.editable !== false) && !hideCrmOpsFields && !Boolean(lead?.campaignViewer)
  const isFranchiseLeadFlag = isFranchiseLead(lead)
  const isLpLead = isFranchiseLpGeoSource(lead.source)

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <Toaster position="top-center" />
      <div className="container mx-auto px-4">
        <div className="sticky top-0 z-30 -mx-4 mb-6 flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50/95 px-4 py-3 backdrop-blur">
          <button
            type="button"
            onClick={goBackToDashboard}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-blue-600 shadow-sm transition-colors hover:bg-blue-50 hover:text-blue-700"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="hidden rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 md:inline-flex"
          >
            Logout
          </button>
        </div>

        <div className={`grid grid-cols-1 gap-6 ${showHistoryPanel ? 'lg:grid-cols-3' : ''}`}>
          {/* Main Details */}
          <div className={`space-y-6 ${showHistoryPanel ? 'lg:col-span-2' : ''}`}>
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Lead Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                  <p className="text-lg font-semibold text-gray-800">{lead.fullName}</p>
                </div>
                {!isExternalCampaignViewer && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mobile</label>
                      <p className="text-lg font-semibold text-gray-800">{lead.mobile}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label>
                      <p className="text-gray-700">{lead.email}</p>
                    </div>
                  </>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">State</label>
                  <p className="text-gray-700">{lead.state || '—'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">City</label>
                  <p className="text-gray-700">{lead.city || '—'}</p>
                </div>
                {!isFranchiseLeadFlag && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Centre</label>
                    <p className="text-gray-800 font-semibold">
                      {lead.centreName || lead.preferredCentreLocation || '—'}
                    </p>
                  </div>
                )}
                {isFranchiseLeadFlag && (
                  <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                        Investment Details
                      </label>
                      <div className="space-y-2">
                        {/* Meta / July LP / WB forms only collect investment capacity */}
                        {isLpLead ? (
                          <div className="space-y-0.5">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase">Investment capacity</p>
                            <p className="text-gray-700">{lead.investmentRange || '₹10–15L'}</p>
                          </div>
                        ) : (
                          <>
                            {lead.franchiseType ? (
                              <div className="space-y-0.5">
                                <p className="text-[11px] font-semibold text-gray-400 uppercase">Franchise type</p>
                                <p className="text-gray-700">{lead.franchiseType}</p>
                              </div>
                            ) : null}
                            <div className="space-y-0.5">
                              <p className="text-[11px] font-semibold text-gray-400 uppercase">Investment range</p>
                              <p className="text-gray-700">{lead.investmentRange || '—'}</p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[11px] font-semibold text-gray-400 uppercase">Expected start</p>
                              <p className="text-gray-700">{expectedStartDisplay(lead)}</p>
                            </div>
                            {lead.preferredCentreLocation ? (
                              <div className="space-y-0.5">
                                <p className="text-[11px] font-semibold text-gray-400 uppercase">Preferred location</p>
                                <p className="text-gray-700">{lead.preferredCentreLocation}</p>
                              </div>
                            ) : null}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                        Lead Source
                      </label>
                      {isLpLead ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase">Source</p>
                            <p className="text-gray-700 font-semibold break-all">
                              {utmSourceDisplay(lead) !== '—' ? utmSourceDisplay(lead) : sourceLabel(lead.source)}
                            </p>
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase">Medium</p>
                            <p className="text-gray-700 break-all">{utmMediumDisplay(lead)}</p>
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase">Campaign</p>
                            <p className="text-gray-700 break-all">{utmCampaignDisplay(lead)}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-gray-700 font-semibold">{sourceLabel(lead.source)}</p>
                          {utmMediumDisplay(lead) !== '—' && (
                            <p className="text-sm text-gray-600">Medium: {utmMediumDisplay(lead)}</p>
                          )}
                          {utmCampaignDisplay(lead) !== '—' && (
                            <p className="text-sm text-gray-600">Campaign: {utmCampaignDisplay(lead)}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {!isFranchiseLeadFlag && (utmMediumDisplay(lead) !== '—' || utmCampaignDisplay(lead) !== '—') && (
                  <div className="col-span-2 space-y-1">
                    {utmMediumDisplay(lead) !== '—' && (
                      <>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Medium</label>
                        <p className="text-gray-700">{utmMediumDisplay(lead)}</p>
                      </>
                    )}
                    {utmCampaignDisplay(lead) !== '—' && (
                      <>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Campaign</label>
                        <p className="text-gray-700">{utmCampaignDisplay(lead)}</p>
                      </>
                    )}
                  </div>
                )}
                {(lead.childAge || lead.enquiryType) && (
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Enquiry details</label>
                    <p className="text-gray-700">
                      {[lead.enquiryType, lead.childAge ? `Child age: ${lead.childAge}` : ''].filter(Boolean).join(' · ') || '—'}
                    </p>
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</label>
                  {!isEditable || lead?.campaignViewer ? (
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                      STATUS_COLORS[lead.status] || 'bg-gray-100 text-gray-600'
                    }`}>
                      {STATUS_LABELS[lead.status] || (lead.status || '').replace('_', ' ')}
                    </span>
                  ) : (
                    <div className="relative inline-block">
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value }))}
                        className={`appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-bold uppercase border-0 cursor-pointer focus:ring-2 focus:ring-blue-500/20 ${
                          editForm.status?.startsWith('converted') ? 'bg-green-100 text-green-700' :
                          ['dropped', 'not_interested', 'wrong_enquiry'].includes(editForm.status) ? 'bg-red-100 text-red-700' :
                          editForm.status === 'untouched' ? 'bg-gray-100 text-gray-700' :
                          'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {(() => {
                          const optionsList = isFranchiseLeadFlag ? FRANCHISE_OPTIONS : NON_FRANCHISE_OPTIONS
                          return (
                            <>
                              {editForm.status && !optionsList.includes(editForm.status) && (
                                <option value={editForm.status} className="bg-white text-gray-800 text-xs font-bold" disabled>
                                  {STATUS_LABELS[editForm.status] || editForm.status}
                                </option>
                              )}
                              {optionsList.map((s) => (
                                <option key={s} value={s} className="bg-white text-gray-800 text-xs font-bold">
                                  {STATUS_LABELS[s] || s}
                                </option>
                              ))}
                            </>
                          )
                        })()}
                      </select>
                      <div className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] ${
                        editForm.status?.startsWith('converted') ? 'text-green-700' :
                        ['dropped', 'not_interested'].includes(editForm.status) ? 'text-red-700' :
                        'text-blue-700'
                      }`}>
                          ▼
                        </div>
                      </div>
                  )}
                </div>
                {!isFranchiseLeadFlag && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Enquiry Source</label>
                    <p className="text-gray-700 font-semibold">{sourceLabel(lead.source)}</p>
                  </div>
                )}
                {!hideCrmOpsFields && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assigned</label>
                    {canAssignUsers ? (
                      <div className="space-y-1.5">
                        <div className="flex gap-2 items-stretch">
                          <select
                            value={editForm.assignedUserId || ''}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, assignedUserId: e.target.value }))
                            }
                            className="form-input w-full text-sm font-semibold text-gray-800"
                            disabled={!isEditable && !canAssignUsers}
                          >
                            <option value="">Select user</option>
                            {assignUserOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={handleAssign}
                            disabled={saving}
                            className="btn-primary text-sm py-1.5 px-4 whitespace-nowrap disabled:opacity-50"
                          >
                            {saving ? '…' : 'Assign'}
                          </button>
                        </div>
                        <p className="text-sm text-gray-600">
                          {lead.assignedUserLabel ? (
                            <>
                              Assigned to{' '}
                              <span className="font-semibold text-[#085390] bg-amber-50 px-1.5 py-0.5 rounded">
                                {lead.assignedUserLabel}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-400">Not assigned yet</span>
                          )}
                        </p>
                      </div>
                    ) : lead.assignedUserLabel || lead.suggestedAssignedUserLabel ? (
                      <p className="text-gray-700 font-semibold">
                        <span className="text-[#085390] bg-amber-50 px-1.5 py-0.5 rounded">
                          {lead.assignedUserLabel || lead.suggestedAssignedUserLabel}
                        </span>
                      </p>
                    ) : (
                      <p className="text-gray-400 text-sm">—</p>
                    )}
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Enquiry Date</label>
                  <p className="text-gray-700">
                    {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                  </p>
                </div>
                {!hideCrmOpsFields && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Last Follow-up Date</label>
                    <p className="text-gray-700">
                      {(() => {
                        const notesDates = (lead.notes || []).map((n: any) => new Date(n.createdAt).getTime());
                        if (notesDates.length === 0) return '—';
                        const lastDate = new Date(Math.max(...notesDates));
                        return lastDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                      })()}
                    </p>
                  </div>
                )}
                {!hideCrmOpsFields && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Next Follow-up Date</label>
                    <p className="text-gray-700 font-semibold text-blue-600">
                      {lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                    </p>
                  </div>
                )}

                {isEditable ? (
                  <>
                    <div className="col-span-2 pt-4 border-t border-gray-100 mt-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                        Comments <span className="text-red-500">*</span>
                        <span className="font-normal normal-case text-gray-400"> (required for status update)</span>
                      </label>
                      <textarea
                        value={editForm.newNote}
                        onChange={(e) => setEditForm((f) => ({ ...f, newNote: e.target.value }))}
                        className="form-input w-full text-sm"
                        rows={3}
                        placeholder="Add comments for this status update..."
                      />
                    </div>

                    <div className={`col-span-2 grid grid-cols-1 ${isFranchiseLeadFlag ? 'sm:grid-cols-2' : ''} gap-4 text-sm py-4 border-t border-gray-100 mt-2`}>
                      {isFranchiseLeadFlag && (
                        <div className="w-full max-w-[260px]">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Meeting Date</label>
                          <input
                            type="datetime-local"
                            value={editForm.meetingDate}
                            onChange={(e) => setEditForm((f) => ({ ...f, meetingDate: e.target.value }))}
                            className="form-input text-sm w-full"
                          />
                        </div>
                      )}
                      <div className="w-full max-w-[260px]">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Next Follow-up</label>
                        <input
                          type="datetime-local"
                          value={editForm.nextFollowUpDate}
                          onChange={(e) => setEditForm((f) => ({ ...f, nextFollowUpDate: e.target.value }))}
                          className="form-input text-sm w-full"
                        />
                      </div>
                      {isFranchiseLeadFlag && (
                        <div className="col-span-1 sm:col-span-2 flex flex-wrap items-center gap-6 pt-1">
                          <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(editForm.meetingFixed)}
                              onChange={(e) => {
                                const checked = e.target.checked
                                setEditForm((f) => ({
                                  ...f,
                                  meetingFixed: checked ? '1' : '',
                                  meetingDone: checked ? f.meetingDone : '',
                                }))
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            Meeting fixed
                          </label>
                          <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(editForm.meetingDone)}
                              onChange={(e) => {
                                const checked = e.target.checked
                                setEditForm((f) => ({
                                  ...f,
                                  meetingDone: checked ? '1' : '',
                                  meetingFixed: checked ? '1' : f.meetingFixed,
                                }))
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            Meeting done
                          </label>
                        </div>
                      )}
                      <div className="col-span-1 sm:col-span-2 flex justify-end mt-2">
                        <button
                          onClick={handleSaveStatus}
                          disabled={saving}
                          className="btn-primary text-sm py-1.5 px-6 w-full sm:w-auto disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Update Status'}
                        </button>
                      </div>
                    </div>
                  </>
                ) : showAgencyCommentHistory ? (
                  <div className="col-span-2 pt-4 border-t border-gray-100 mt-2 space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                      Add comment
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="form-input w-full text-sm"
                      rows={3}
                      placeholder="Write a comment for this lead..."
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddNote}
                        disabled={saving || !note.trim()}
                        className="btn-primary text-sm py-1.5 px-6 disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Add comment'}
                      </button>
                    </div>
                  </div>
                ) : hideCrmOpsFields ? null : (
                  <>
                    <div className="col-span-2 pt-4 border-t border-gray-100 mt-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Original Message</label>
                      <p className="text-gray-700 mt-1 italic">{lead.comments || 'No original message'}</p>
                    </div>

                    <div className="col-span-2 flex flex-wrap gap-6 text-sm py-4 border-t border-gray-100 mt-2">
                      {isFranchiseLeadFlag && (
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Meeting Date</label>
                          <p className="font-medium">{formatLeadDateTime(lead.meetingDate)}</p>
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Next Follow-up</label>
                        <p className="font-medium text-blue-600">{formatLeadDateTime(lead.nextFollowUpDate)}</p>
                      </div>
                      {isFranchiseLeadFlag && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Meeting fixed</label>
                            <p className="font-medium">{lead.meetingFixed ? 'Yes' : 'No'}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Meeting done</label>
                            <p className="font-medium">{lead.meetingDone ? 'Yes' : 'No'}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>

          {showHistoryPanel && (
            <div className="space-y-6">
              {!hideCrmOpsFields && (
              <div className="card">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Direct Contact</h3>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={openWhatsAppCompose}
                    disabled={!lead.mobile}
                    className="block w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-center font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={openEmailCompose}
                    disabled={!lead.email}
                    className="block w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-center font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Email
                  </button>
                </div>
              </div>
              )}

              <div className="card">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  History
                </h3>

                <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 pb-4">
                  {[
                    ...(lead.notes || []).map((n: any) => ({
                      id: n.id,
                      type: 'comment',
                      content: n.content,
                      date: new Date(n.createdAt),
                      bgColor: 'bg-blue-50',
                      textColor: 'text-blue-800',
                      dotColor: 'bg-blue-500',
                      status: n.status,
                    })),
                    ...(lead.auditLogs || []).map((a: any) => ({
                      id: a.id,
                      type: 'audit',
                      content:
                        a.action === 'status_change' ? (
                          <span>
                            Status changed to{' '}
                            <span className="font-bold uppercase">
                              {a.newValues?.status?.replace('_', ' ')}
                            </span>
                          </span>
                        ) : a.action === 'create' ? (
                          'Lead created in system'
                        ) : (
                          `${a.action.replace('_', ' ')} action`
                        ),
                      date: new Date(a.createdAt),
                      user: a.user?.fullName,
                      bgColor: 'bg-purple-50',
                      textColor: 'text-purple-800',
                      dotColor: 'bg-purple-500',
                    })),
                    ...(lead.notificationLogs || []).map((l: any) => ({
                      id: l.id,
                      type: 'notification',
                      content: `${l.type === 'whatsapp' ? 'WhatsApp' : 'Email'} sent`,
                      date: new Date(l.createdAt),
                      channel: l.type === 'whatsapp' ? 'WhatsApp' : 'Email',
                      status: l.status || 'sent',
                      bgColor: 'bg-green-50',
                      textColor: 'text-green-800',
                      dotColor: 'bg-green-500',
                    })),
                    ...(lead.callHistory || []).map((c: any) => ({
                      id: c.id,
                      type: 'call',
                      content: (
                        <div>
                          <p className="font-bold">{c.isAnswered ? 'Answered Call' : 'No Answer'}</p>
                          {c.duration > 0 && (
                            <p className="text-xs text-gray-500">Duration: {c.duration} mins</p>
                          )}
                          {c.notes && <p className="mt-1">{c.notes}</p>}
                        </div>
                      ),
                      date: new Date(c.createdAt),
                      bgColor: 'bg-rose-50',
                      textColor: 'text-rose-800',
                      dotColor: 'bg-rose-500',
                    })),
                  ]
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                    .map((item, idx) => (
                      <div key={`${item.type}-${item.id || idx}`} className="relative pl-8">
                        <div
                          className={`absolute left-[-9px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm ${item.dotColor}`}
                        />
                        <div
                          className={`p-4 rounded-xl ${item.bgColor} border border-gray-100 shadow-sm transition-all hover:shadow-md`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span
                              className={`text-xs font-bold uppercase tracking-wider ${item.textColor}`}
                            >
                              {item.type === 'notification'
                                ? item.channel || 'Communication'
                                : item.type.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium">
                              {item.date.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
                            {item.content}
                          </div>
                          {item.user && (
                            <div className="mt-2 text-[10px] text-gray-400 font-medium">
                              Action by: {item.user}
                            </div>
                          )}
                          {item.status && (
                            <div className="mt-1.5 flex items-center gap-1.5">
                              {item.type === 'comment' ? (
                                <>
                                  <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                                    Status:
                                  </span>
                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                      STATUS_COLORS[item.status] ||
                                      'bg-gray-100 text-gray-800 border border-gray-200'
                                    }`}
                                  >
                                    {STATUS_LABELS[item.status] || item.status.replace('_', ' ')}
                                  </span>
                                </>
                              ) : (
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                    item.status === 'sent'
                                      ? 'bg-green-200 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {item.status.toUpperCase()}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  <div className="absolute bottom-0 left-[-9px] w-4 h-4 rounded-full border-4 border-white bg-gray-200 shadow-sm" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {whatsappComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="text-lg font-bold text-gray-800">Compose WhatsApp</h3>
              <p className="mt-1 text-xs text-gray-500">
                Edit the message, then open WhatsApp to send
              </p>
            </div>
            <div className="space-y-3 px-5 py-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-400">
                  To
                </label>
                <input
                  type="text"
                  value={lead.mobile || ''}
                  readOnly
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-400">
                  Message
                </label>
                <textarea
                  value={whatsappMessage}
                  onChange={(e) => setWhatsappMessage(e.target.value)}
                  rows={8}
                  className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
              <button
                type="button"
                onClick={() => setWhatsappComposeOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600"
              >
                Open WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {emailComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="text-lg font-bold text-gray-800">Compose email</h3>
              <p className="mt-1 text-xs text-gray-500">
                From: franchise@timekidspreschools.com · Edit then send
              </p>
            </div>
            <div className="space-y-3 px-5 py-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-400">
                  To
                </label>
                <input
                  type="text"
                  value={lead.email || ''}
                  readOnly
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-400">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-400">
                  Body
                </label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={10}
                  className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
              <button
                type="button"
                onClick={() => setEmailComposeOpen(false)}
                disabled={sendingDirectEmail}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDirectEmail}
                disabled={sendingDirectEmail}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {sendingDirectEmail ? 'Sending…' : 'Send email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}