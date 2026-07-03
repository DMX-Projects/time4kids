'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/crmApi'
import { toast } from 'react-hot-toast'
import { getWhatsAppUrl, getEmailMailto } from '@/lib/crmContactHelpers'

const STATUS_OPTIONS = [
  'new', 'contacted', 'called', 'follow_up', 'interested',
  'converted', 'dropped', 'not_interested',
]
const SOURCE_OPTIONS = [
  'facebook', 'instagram', 'website', 'google_ads', 'referral', 'walk_in', 'other',
]

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
        source: lead.source ?? 'website',
        sourceOther: lead.sourceOther ?? '',
        comments: lead.comments ?? '',
        status: lead.status ?? 'new',
        meetingDate: lead.meetingDate
          ? new Date(lead.meetingDate).toISOString().slice(0, 10)
          : '',
        nextFollowUpDate: lead.nextFollowUpDate
          ? new Date(lead.nextFollowUpDate).toISOString().slice(0, 16)
          : '',
      })
    }
  }, [lead])

  const loadLead = async () => {
    try {
      const response = await api.get(`/leads/${params.id}`)
      setLead(response.data)
    } catch (error) {
      toast.error('Failed to load lead details')
      router.push('/crm-admin')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await api.patch(`/leads/${params.id}`, { status: newStatus })
      toast.success('Status updated')
      loadLead()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        fullName: editForm.fullName,
        mobile: editForm.mobile,
        email: editForm.email,
        city: editForm.city,
        state: editForm.state,
        preferredCentreLocation: editForm.preferredCentreLocation,
        franchiseType: editForm.franchiseType || undefined,
        investmentRange: editForm.investmentRange || undefined,
        expectedStartDate: editForm.expectedStartDate || undefined,
        source: editForm.source,
        sourceOther: editForm.sourceOther || undefined,
        comments: editForm.comments || undefined,
        status: editForm.status,
        meetingDate: editForm.meetingDate || null,
        nextFollowUpDate: editForm.nextFollowUpDate || null,
      }
      await api.patch(`/leads/${params.id}`, payload)
      toast.success('All fields saved')
      setEditing(false)
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => router.push('/crm-admin')}
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
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="btn-secondary text-sm">
                    Edit All
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(false)} className="btn-secondary text-sm">
                      Cancel
                    </button>
                    <button onClick={handleSaveAll} disabled={saving} className="btn-primary text-sm disabled:opacity-50">
                      {saving ? 'Saving...' : 'Save All'}
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {editing ? (
                  <>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Full Name</label>
                      <input
                        value={editForm.fullName}
                        onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))}
                        className="form-input mt-1 w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Mobile</label>
                      <input
                        value={editForm.mobile}
                        onChange={(e) => setEditForm((f) => ({ ...f, mobile: e.target.value }))}
                        className="form-input mt-1 w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                        className="form-input mt-1 w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">City</label>
                      <input
                        value={editForm.city}
                        onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
                        className="form-input mt-1 w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">State</label>
                      <input
                        value={editForm.state}
                        onChange={(e) => setEditForm((f) => ({ ...f, state: e.target.value }))}
                        className="form-input mt-1 w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Preferred Location</label>
                      <input
                        value={editForm.preferredCentreLocation}
                        onChange={(e) => setEditForm((f) => ({ ...f, preferredCentreLocation: e.target.value }))}
                        className="form-input mt-1 w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Franchise Type</label>
                      <input
                        value={editForm.franchiseType}
                        onChange={(e) => setEditForm((f) => ({ ...f, franchiseType: e.target.value }))}
                        className="form-input mt-1 w-full"
                        placeholder="e.g. preschool, daycare"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Investment Range</label>
                      <input
                        value={editForm.investmentRange}
                        onChange={(e) => setEditForm((f) => ({ ...f, investmentRange: e.target.value }))}
                        className="form-input mt-1 w-full"
                        placeholder="e.g. 20-30 Lakhs"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Expected Start Date</label>
                      <input
                        type="date"
                        value={editForm.expectedStartDate}
                        onChange={(e) => setEditForm((f) => ({ ...f, expectedStartDate: e.target.value }))}
                        className="form-input mt-1 w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Source</label>
                      <select
                        value={editForm.source}
                        onChange={(e) => setEditForm((f) => ({ ...f, source: e.target.value }))}
                        className="form-select mt-1 w-full"
                      >
                        {SOURCE_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Status</label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                        className="form-select mt-1 w-full"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Meeting Date</label>
                      <input
                        type="date"
                        value={editForm.meetingDate}
                        onChange={(e) => setEditForm((f) => ({ ...f, meetingDate: e.target.value }))}
                        className="form-input mt-1 w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Next Follow-up</label>
                      <input
                        type="datetime-local"
                        value={editForm.nextFollowUpDate}
                        onChange={(e) => setEditForm((f) => ({ ...f, nextFollowUpDate: e.target.value }))}
                        className="form-input mt-1 w-full"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-semibold text-gray-600">Comments</label>
                      <textarea
                        value={editForm.comments}
                        onChange={(e) => setEditForm((f) => ({ ...f, comments: e.target.value }))}
                        className="form-input mt-1 w-full"
                        rows={3}
                      />
                    </div>
                  </>
                ) : (
                  <>
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
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</label>
                      <div className="relative inline-block">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(e.target.value)}
                          className={`appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-bold uppercase border-0 cursor-pointer focus:ring-2 focus:ring-blue-500/20 ${lead.status === 'converted' ? 'bg-green-100 text-green-700' :
                            lead.status === 'dropped' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                            }`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s} className="bg-white text-gray-800 uppercase text-xs font-bold">
                              {s.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                        <div className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] ${lead.status === 'converted' ? 'text-green-700' :
                          lead.status === 'dropped' ? 'text-red-700' :
                            'text-blue-700'
                          }`}>
                          ▼
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Source</label>
                      <p className="text-gray-700 capitalize">{lead.source?.replace('_', ' ')}</p>
                    </div>

                    <div className="col-span-2 pt-4 border-t border-gray-100 mt-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Comments</label>
                      <p className="text-gray-700 mt-1 italic">{lead.comments || 'No comments provided'}</p>
                    </div>

                    <div className="col-span-2 flex gap-6 text-sm py-4 border-t border-gray-100 mt-2">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Meeting Date</label>
                        <p className="font-medium">{lead.meetingDate ? new Date(lead.meetingDate).toLocaleDateString() : '—'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Next Follow-up</label>
                        <p className="font-medium text-blue-600">{lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleString() : '—'}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Interaction Timeline */}
            <div className="card">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-2xl">⏳</span> Lead Interaction Timeline
              </h3>

              <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 pb-4">
                {[
                  ...(lead.notes || []).map((n: any) => ({
                    id: n.id,
                    type: 'note',
                    content: n.content,
                    date: new Date(n.createdAt),
                    icon: '📝',
                    bgColor: 'bg-blue-50',
                    textColor: 'text-blue-800',
                    dotColor: 'bg-blue-500'
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
                          <div className="mt-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${item.status === 'sent' ? 'bg-green-200 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {item.status.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                <div className="absolute bottom-0 left-[-9px] w-4 h-4 rounded-full border-4 border-white bg-gray-200 shadow-sm" />
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1"><span>➕</span> Add Internal Note</h4>
                <div className="relative">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="form-input focus:ring-blue-500 border-gray-200"
                    rows={3}
                    placeholder="Type interaction details here..."
                  />
                  <div className="flex justify-end mt-3">
                    <button onClick={handleAddNote} className="btn-primary !py-2 !px-6 text-sm flex items-center gap-2">
                      <span>💾</span> Save Note
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button onClick={() => handleStatusChange('contacted')} className="w-full btn-secondary text-sm">Mark as Contacted</button>
                <button onClick={() => handleStatusChange('interested')} className="w-full btn-secondary text-sm">Mark as Interested</button>
                <button onClick={() => handleStatusChange('converted')} className="w-full btn-primary text-sm">Mark as Converted</button>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Direct Contact</h3>
              <div className="space-y-3">
                <a href={getWhatsAppUrl(lead.mobile)} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-center font-semibold">WhatsApp</a>
                <a href={getEmailMailto(lead.email)} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-center font-semibold">Email</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
