'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/crmApi'
import { Toaster, toast } from 'react-hot-toast'
import { getWhatsAppUrl, getEmailMailto } from '@/lib/crmContactHelpers'
import { getCrmDashboardReturnHref, isSafeCrmReturnHref } from '@/lib/crmDashboardFilters'
import { Clock } from 'lucide-react'

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

interface LeadTemplate {
  whatsapp: string;
  emailSubject: string;
  emailBody: string;
}

const getTemplatesForLead = (lead: any): LeadTemplate => {
  const isFranchise = lead.leadKind === 'franchiseenquiry' || lead.enquiryType === 'FRANCHISE' || lead.source === 'franchise';
  const isAdmission = lead.leadKind === 'enquiry' && lead.enquiryType === 'ADMISSION';
  const isCenterPage = lead.leadKind === 'enquiry' && lead.enquiryType === 'CONTACT';
  
  if (isFranchise) {
    return {
      whatsapp: "Hi! I am from T.I.M.E. Kids. We received your franchise enquiry and would love to connect with you. When would be a good time to talk?",
      emailSubject: "T.I.M.E. Kids – Follow-up on your franchise enquiry",
      emailBody: `Hi,

I'm following up on your franchise enquiry with T.I.M.E. Kids.

We'd love to discuss the opportunity with you. Please let us know a convenient time for a quick call.

Best regards,
T.I.M.E. Kids Team`
    };
  }
  
  if (isAdmission) {
    return {
      whatsapp: "Hi! I am from T.I.M.E. Kids. We received your preschool admission enquiry and would love to connect with you to discuss the details. When would be a good time to talk?",
      emailSubject: "T.I.M.E. Kids Preschool – Follow-up on your admission enquiry",
      emailBody: `Hi,

I'm following up on your preschool admission enquiry with T.I.M.E. Kids.

We'd love to invite you and your child for a visit to our center and share the details. Please let us know a convenient time to connect.

Best regards,
T.I.M.E. Kids Team`
    };
  }
  
  if (isCenterPage) {
    return {
      whatsapp: "Hi! I am from T.I.M.E. Kids. We received your enquiry and would love to connect with you to assist. When would be a good time to talk?",
      emailSubject: "T.I.M.E. Kids – Follow-up on your enquiry",
      emailBody: `Hi,

I'm following up on your enquiry with T.I.M.E. Kids.

We'd love to help answer any questions you have. Please let us know a convenient time for a quick call.

Best regards,
T.I.M.E. Kids Team`
    };
  }
  
  return {
    whatsapp: "Hi! I am from T.I.M.E. Kids. We saw that you registered interest via our online campaign. When would be a good time to talk?",
    emailSubject: "T.I.M.E. Kids – Information regarding your inquiry",
    emailBody: `Hi,

I'm following up on your interest registered via our online campaign with T.I.M.E. Kids.

We'd love to connect and share more details with you. Please let us know a convenient time for a quick call.

Best regards,
T.I.M.E. Kids Team`
  };
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
  converted_mou_signed: 'Converted – MOU Signed',
  converted_agreement_signed: 'Converted – Agreement Signed',
  join_later: 'Join Later',
  not_answering_calls: 'Not Answering Calls',

  // Legacy mappings for display fallback
  new: 'Untouched',
  called: 'Not answering',
  contacted: 'Not answering',
  converted: 'Converted to Admission',
  dropped: 'Not Interested',
  interested: 'Follow-up',
  meeting_scheduled: 'Visited the school',
}

const NON_FRANCHISE_OPTIONS = [
  'untouched',
  'not_answering',
  'follow_up',
  'visited_school',
  'converted_admission',
  'joined_competition',
  'not_interested',
  'wrong_enquiry',
]

const FRANCHISE_OPTIONS = [
  'untouched',
  'hot',
  'warm',
  'follow_up',
  'cold',
  'converted_mou_signed',
  'converted_agreement_signed',
  'join_later',
  'not_interested',
  'not_answering_calls',
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

  // Legacy mappings for display fallback
  new: 'bg-gray-100 text-gray-700 border border-gray-200',
  called: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  contacted: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  converted: 'bg-green-100 text-green-700 border border-green-200',
  dropped: 'bg-red-100 text-red-700 border border-red-200',
  interested: 'bg-blue-100 text-blue-800 border border-blue-200',
  meeting_scheduled: 'bg-teal-100 text-teal-800 border border-teal-200',
}
const SOURCE_OPTIONS = [
  'facebook', 'instagram', 'website', 'google_ads', 'referral', 'walk_in', 'other',
]

const SOURCE_LABELS: Record<string, string> = {
  contact: 'CenterPage',
  admission: 'Admission',
  landing: 'Landing',
  campaign: 'Campaign',
  website: 'Website',
  facebook: 'Facebook',
  instagram: 'Instagram',
}

function sourceLabel(source?: string) {
  if (!source) return '—'
  return SOURCE_LABELS[source] || source.replace(/_/g, ' ')
}

export default function LeadDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [lead, setLead] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sendingReminder, setSendingReminder] = useState(false)
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false)
  const [editForm, setEditForm] = useState<Record<string, string>>({})

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
        meetingDate: toLocalDatetimeString(lead.meetingDate),
        nextFollowUpDate: toLocalDatetimeString(lead.nextFollowUpDate),
      })
    }
  }, [lead])

  const goBackToDashboard = () => {
    if (typeof window !== 'undefined') {
      const from = new URLSearchParams(window.location.search).get('from')
      if (isSafeCrmReturnHref(from)) {
        router.push(from)
        return
      }
    }
    router.push(getCrmDashboardReturnHref())
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

  const handleSaveAll = async () => {
    if (!editForm.newNote?.trim()) {
      toast.error('Please enter a comment before saving.')
      return
    }

    setSaving(true)
    try {
      await api.post(`/leads/${params.id}/notes`, { 
        content: editForm.newNote.trim(),
        status: editForm.status
      })
      
      const payload: Record<string, unknown> = {
        meetingDate: editForm.meetingDate ? new Date(editForm.meetingDate).toISOString() : null,
        nextFollowUpDate: editForm.nextFollowUpDate ? new Date(editForm.nextFollowUpDate).toISOString() : null,
        status: editForm.status,
      }
      await api.patch(`/leads/${params.id}`, payload)
      
      if (editForm.status !== lead.status) {
        toast.success('Status updated successfully!')
      } else {
        toast.success('Details saved successfully!')
      }
      
      setEditForm(f => ({ ...f, newNote: '' }))
      loadLead()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleAddNote = async () => {
    if (!note.trim()) {
      toast.error('Please enter a note')
      return
    }
    try {
      await api.post(`/leads/${params.id}/notes`, { content: note })
      toast.success('Note added')
      setNote('')
      loadLead()
    } catch (error) {
      toast.error('Failed to add note')
    }
  }

  const handleSendReminder = async () => {
    setSendingReminder(true)
    try {
      const type = lead.meetingDate ? 'meeting' : 'follow-up'
      await api.post('/leads/send-reminder', {
        leadId: params.id,
        type,
        channel: 'email'
      })
      toast.success(`${type === 'meeting' ? 'Meeting reminder' : 'Follow-up'} email sent successfully!`)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send reminder')
    } finally {
      setSendingReminder(false)
    }
  }

  const handleSendWhatsApp = async () => {
    setSendingWhatsApp(true)
    try {
      const type = lead.meetingDate ? 'meeting' : 'follow-up'
      await api.post('/leads/send-reminder', {
        leadId: params.id,
        type,
        channel: 'whatsapp'
      })
      toast.success(`${type === 'meeting' ? 'Meeting reminder' : 'Follow-up'} WhatsApp message sent!`)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send WhatsApp message')
    } finally {
      setSendingWhatsApp(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!lead) {
    return <div className="min-h-screen flex items-center justify-center">Lead not found</div>
  }

  const isEditable = lead.editable !== false
  const isFranchiseLead = lead.leadKind === 'franchiseenquiry' || lead.enquiryType === 'FRANCHISE' || lead.source === 'franchise';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster position="top-center" />
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between gap-3">
          <button
            onClick={goBackToDashboard}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Lead Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                  <p className="text-lg font-semibold text-gray-800">{lead.fullName}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mobile</label>
                  <p className="text-lg font-semibold text-gray-800">{lead.mobile}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label>
                  <p className="text-gray-700">{lead.email}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</label>
                  <p className="text-gray-700">{lead.city}, {lead.state}</p>
                </div>
                {(lead.franchiseType || lead.investmentRange || lead.expectedStartDate) && (
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Franchise details</label>
                    <p className="text-gray-700">
                      {[lead.franchiseType, lead.investmentRange, lead.expectedStartDate].filter(Boolean).join(' · ') || '—'}
                    </p>
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
                        const optionsList = isFranchiseLead ? FRANCHISE_OPTIONS : NON_FRANCHISE_OPTIONS
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
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Enquiry Source</label>
                  <p className="text-gray-700 font-semibold">{sourceLabel(lead.source)}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Enquiry Date</label>
                  <p className="text-gray-700">
                    {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                  </p>
                </div>
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
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Next Follow-up Date</label>
                  <p className="text-gray-700 font-semibold text-blue-600">
                    {lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                  </p>
                </div>

                {isEditable ? (
                  <>
                    <div className="col-span-2 pt-4 border-t border-gray-100 mt-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                        Comments <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={editForm.newNote}
                        onChange={(e) => setEditForm((f) => ({ ...f, newNote: e.target.value }))}
                        className="form-input w-full text-sm"
                        rows={3}
                        placeholder="Add comments here..."
                      />
                    </div>

                    <div className={`col-span-2 grid grid-cols-1 ${isFranchiseLead ? 'sm:grid-cols-2' : ''} gap-4 text-sm py-4 border-t border-gray-100 mt-2`}>
                      {isFranchiseLead && (
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
                      <div className="col-span-1 sm:col-span-2 flex justify-end mt-2">
                        <button
                          onClick={handleSaveAll}
                          disabled={saving}
                          className="btn-primary text-sm py-1.5 px-6 w-full sm:w-auto disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-span-2 pt-4 border-t border-gray-100 mt-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Original Message</label>
                      <p className="text-gray-700 mt-1 italic">{lead.comments || 'No original message'}</p>
                    </div>

                    <div className="col-span-2 flex gap-6 text-sm py-4 border-t border-gray-100 mt-2">
                      {isFranchiseLead && (
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Meeting Date</label>
                          <p className="font-medium">{formatLeadDateTime(lead.meetingDate)}</p>
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Next Follow-up</label>
                        <p className="font-medium text-blue-600">{formatLeadDateTime(lead.nextFollowUpDate)}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>

          <div className="space-y-6">


             <div className="card">
               <h3 className="text-xl font-bold text-gray-800 mb-4">Direct Contact</h3>
               <div className="space-y-3">
                 {lead && (() => {
                   const templates = getTemplatesForLead(lead);
                   return (
                     <>
                       <a
                         href={getWhatsAppUrl(lead.mobile, templates.whatsapp)}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="block px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-center font-semibold"
                       >
                         WhatsApp
                       </a>
                       <a
                         href={getEmailMailto(lead.email, templates.emailSubject, templates.emailBody)}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-center font-semibold"
                       >
                         Email
                       </a>
                     </>
                   );
                 })()}
               </div>
             </div>

            {/* Interaction Timeline */}
            <div className="card">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-2xl">⏳</span> History
              </h3>

              <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 pb-4">
                {[
                  ...(lead.notes || []).map((n: any) => ({
                    id: n.id,
                    type: 'comment',
                    content: n.content,
                    date: new Date(n.createdAt),
                    icon: '💬',
                    bgColor: 'bg-blue-50',
                    textColor: 'text-blue-800',
                    dotColor: 'bg-blue-500',
                    status: n.status
                  })),
                  ...(lead.auditLogs || []).map((a: any) => ({
                    id: a.id,
                    type: 'audit',
                    content: a.action === 'status_change'
                      ? (<span>Status changed to <span className="font-bold uppercase">{a.newValues?.status?.replace('_', ' ')}</span></span>)
                      : a.action === 'create' ? 'Lead created in system' : `${a.action.replace('_', ' ')} action`,
                    date: new Date(a.createdAt),
                    icon: a.action === 'status_change' ? '🔄' : '✨',
                    user: a.user?.fullName,
                    bgColor: 'bg-purple-50',
                    textColor: 'text-purple-800',
                    dotColor: 'bg-purple-500'
                  })),
                  ...(lead.notificationLogs || []).map((l: any) => ({
                    id: l.id,
                    type: 'notification',
                    content: `${l.type === 'whatsapp' ? 'WhatsApp' : 'Email'} reminder sent`,
                    date: new Date(l.createdAt),
                    icon: l.type === 'whatsapp' ? '💬' : '📧',
                    status: l.status,
                    bgColor: 'bg-green-50',
                    textColor: 'text-green-800',
                    dotColor: 'bg-green-500'
                  })),
                  ...(lead.callHistory || []).map((c: any) => ({
                    id: c.id,
                    type: 'call',
                    content: (
                      <div>
                        <p className="font-bold">{c.isAnswered ? '📞 Answered Call' : '📞 No Answer'}</p>
                        {c.duration > 0 && <p className="text-xs text-gray-500">Duration: {c.duration} mins</p>}
                        {c.notes && <p className="mt-1">{c.notes}</p>}
                      </div>
                    ),
                    date: new Date(c.createdAt),
                    icon: '📞',
                    bgColor: 'bg-rose-50',
                    textColor: 'text-rose-800',
                    dotColor: 'bg-rose-500'
                  }))
                ]
                  .sort((a, b) => b.date.getTime() - a.date.getTime())
                  .map((item, idx) => (
                    <div key={`${item.type}-${item.id || idx}`} className="relative pl-8">
                      <div className={`absolute left-[-9px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm ${item.dotColor}`} />
                      <div className={`p-4 rounded-xl ${item.bgColor} border border-gray-100 shadow-sm transition-all hover:shadow-md`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-xs font-bold uppercase tracking-wider ${item.textColor} flex items-center gap-1`}>
                            {item.icon} {item.type.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-gray-500 font-medium">{item.date.toLocaleString()}</span>
                        </div>
                        <div className="text-gray-800 text-sm leading-relaxed">{item.content}</div>
                        {item.user && <div className="mt-2 text-[10px] text-gray-400 font-medium">Action by: {item.user}</div>}
                        {item.status && (
                          <div className="mt-1.5 flex items-center gap-1.5">
                            {item.type === 'comment' ? (
                              <>
                                <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Status:</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${STATUS_COLORS[item.status] || 'bg-gray-100 text-gray-800 border border-gray-200'}`}>
                                  {STATUS_LABELS[item.status] || item.status.replace('_', ' ')}
                                </span>
                              </>
                            ) : (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${item.status === 'sent' ? 'bg-green-200 text-green-800' : 'bg-red-100 text-red-800'}`}>
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
        </div>
      </div>
    </div>
  )
}
