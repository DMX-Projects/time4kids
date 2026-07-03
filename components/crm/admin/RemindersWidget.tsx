'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/crmApi'
import { getWhatsAppUrl, getEmailMailto } from '@/lib/crmContactHelpers'
import { toast } from 'react-hot-toast'

interface Lead {
  id: string
  fullName: string
  mobile: string
  email: string
  meetingDate?: string
  nextFollowUpDate?: string
  createdAt: string
  status: string
  preferredCentreLocation?: string
}

export default function RemindersWidget({ source, centreId }: { source?: string; centreId?: string }) {
  const [data, setData] = useState<{ meetings: Lead[]; followUps: Lead[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [sendingReminder, setSendingReminder] = useState<string | null>(null)

  const fetchReminders = async (isInitial = false) => {
    if (isInitial) setLoading(true)
    else setRefreshing(true)

    try {
      const params = new URLSearchParams()
      if (source) params.append('source', source)
      if (centreId) params.append('centreId', centreId)
      params.append('_t', Date.now().toString()) // cache bust

      const res = await api.get(`/leads/reminders?${params.toString()}`)
      setData(res.data)
    } catch (error) {
      console.error('Failed to fetch reminders:', error)
      setData({ meetings: [], followUps: [] })
    } finally {
      if (isInitial) setLoading(false)
      else setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchReminders(true)
  }, [source, centreId])

  const handleSendReminder = async (leadId: string, type: 'meeting' | 'follow-up', channel: 'email' | 'whatsapp' = 'email') => {
    setSendingReminder(`${leadId}-${channel}`)
    try {
      await api.post('/leads/send-reminder', { leadId, type, channel })
      toast.success(`${channel === 'whatsapp' ? 'WhatsApp' : 'Email'} sent successfully!`)
      // Refresh list to remove the lead if it was a follow-up
      fetchReminders()
    } catch (error: any) {
      toast.error(error.response?.data?.error || `Failed to send ${channel}`)
    } finally {
      setSendingReminder(null)
    }
  }

  if (loading) {
    return (
      <div className="card">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Reminders</h3>
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  const meetings = data?.meetings ?? []
  const followUps = data?.followUps ?? []

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Reminders</h3>
          <p className="text-sm text-gray-600">
            Upcoming meetings and follow-ups.
          </p>
        </div>
        <button
          onClick={() => fetchReminders()}
          disabled={refreshing}
          className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
          title="Refresh reminders"
        >
          <svg
            className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {meetings.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">
              📅 Upcoming meetings (next 7 days)
            </h4>
            <div className="max-h-[320px] overflow-y-auto no-scrollbar pr-1">
              <ul className="space-y-2">
                {meetings.map((lead) => (
                  <li
                    key={lead.id}
                    className="flex flex-col gap-2 py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Link
                          href={`/crm-admin/leads/${lead.id}`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {lead.fullName}
                        </Link>
                        <span className="text-gray-500 text-sm ml-2">
                          {lead.meetingDate
                            ? new Date(lead.meetingDate).toLocaleString()
                            : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      <button
                        onClick={() => handleSendReminder(lead.id, 'meeting', 'whatsapp')}
                        disabled={!!sendingReminder}
                        className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingReminder === `${lead.id}-whatsapp` ? '...' : 'WhatsApp'}
                      </button>
                      <button
                        onClick={() => handleSendReminder(lead.id, 'meeting', 'email')}
                        disabled={!!sendingReminder}
                        className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingReminder === `${lead.id}-email` ? '...' : 'Email'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {followUps.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">
              🔔 Follow-ups due (scheduled or idle 24h+)
            </h4>
            <div className="max-h-[320px] overflow-y-auto no-scrollbar pr-1">
              <ul className="space-y-2">
                {followUps.map((lead) => (
                  <li
                    key={lead.id}
                    className="flex flex-col gap-2 py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Link
                          href={`/crm-admin/leads/${lead.id}`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {lead.fullName}
                        </Link>
                        <span className="text-gray-500 text-sm ml-2 capitalize">
                          {lead.status.replace('_', ' ')}
                          {lead.nextFollowUpDate && ` (Due: ${new Date(lead.nextFollowUpDate).toLocaleString()})`}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      <button
                        onClick={() => handleSendReminder(lead.id, 'follow-up', 'whatsapp')}
                        disabled={!!sendingReminder}
                        className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingReminder === `${lead.id}-whatsapp` ? '...' : 'WhatsApp'}
                      </button>
                      <button
                        onClick={() => handleSendReminder(lead.id, 'follow-up', 'email')}
                        disabled={!!sendingReminder}
                        className="px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingReminder === `${lead.id}-email` ? '...' : 'Email'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {meetings.length === 0 && followUps.length === 0 && (
          <p className="text-gray-500">No upcoming meetings or follow-ups right now.</p>
        )}
      </div>
    </div >
  )
}
