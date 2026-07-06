'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/crmApi'
import { toast } from 'react-hot-toast'

interface LeadsTableProps {
  dateRange: { startDate: Date | null; endDate: Date | null }
  city?: string
  centreId?: string
  status?: string
  source?: string
  search?: string
  title?: string
  onLeadUpdated?: () => void
}

const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight || !highlight.trim() || !text) return <>{text}</>
  // escape regex characters in highlight string
  const safeHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${safeHighlight})`, 'gi')
  const parts = text.split(regex)
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 text-gray-900 rounded-sm px-0.5 font-semibold">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

const SOURCE_LABELS: Record<string, string> = {
  website: 'Website',
  facebook: 'Facebook',
  instagram: 'Instagram',
  admission: 'Admission',
  contact: 'Centers Enquiry',
  campaign: 'Campaign Enquiry',
  landing: 'Landing Lead',
}

const STATUS_OPTIONS = [
  'contacted',
  'follow_up',
  'interested',
  'meeting_scheduled',
  'dropped',
  'converted',
]

const statusColors: { [key: string]: string } = {
  new: 'status-new',
  contacted: 'status-contacted',
  called: 'status-contacted',
  follow_up: 'status-follow-up',
  interested: 'status-interested',
  meeting_scheduled: 'status-follow-up',
  converted: 'status-converted',
  dropped: 'status-dropped',
  not_interested: 'status-dropped',
}

export default function LeadsTable({ dateRange, city, centreId, status, source, search, title, onLeadUpdated }: LeadsTableProps) {
  const router = useRouter()
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 350)
    return () => clearTimeout(t)
  }, [searchTerm])

  useEffect(() => {
    loadLeads()
  }, [page, dateRange, city, centreId, status, source, debouncedSearch])

  const loadLeads = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      })
      if (dateRange.startDate) {
        const start = new Date(dateRange.startDate)
        start.setHours(0, 0, 0, 0)
        params.append('startDate', start.toISOString())
      }
      if (dateRange.endDate) {
        const end = new Date(dateRange.endDate)
        end.setHours(23, 59, 59, 999)
        params.append('endDate', end.toISOString())
      }
      if (city) params.append('city', city)
      if (centreId) params.append('centreId', centreId)
      if (status) params.append('status', status)
      if (source) params.append('source', source)
      if (debouncedSearch) params.append('search', debouncedSearch)

      const response = await api.get(`/leads?${params.toString()}`)
      setLeads(response.data.leads)
      setTotal(response.data.total)
    } catch (error) {
      console.error('Failed to load leads:', error)
      toast.error('Failed to load leads')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    setUpdatingId(leadId)
    // Optimistically update the row immediately
    setLeads((prev) => prev.map((l) => l._id === leadId || l.id === leadId ? { ...l, status: newStatus } : l))
    try {
      await api.patch(`/leads/${encodeURIComponent(leadId)}`, { status: newStatus })
      toast.success('Status updated')
      onLeadUpdated?.()
    } catch (error) {
      // Revert optimistic update on failure
      loadLeads(true)
      toast.error('Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  const sourceLabel = (source?: string) => SOURCE_LABELS[source || ''] || source?.replace('_', ' ') || 'Website'

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-gray-800">{title ?? 'Enquiry Reports'}</h3>
        <div className="w-full sm:w-80 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder=""
            className="form-input w-full !pl-10 pr-4 py-2 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl transition-all shadow-sm bg-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <span>Loading leads...</span>
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No leads found</p>
          <p className="text-sm mt-1">Try adjusting the filters or search terms.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">City / Location</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">Centre</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 text-nowrap">Source</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className={`hover:bg-gray-50 transition-colors ${updatingId === lead.id ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-4 font-medium text-gray-900">
                      <HighlightText text={lead.fullName || ''} highlight={debouncedSearch} />
                    </td>
                    <td className="px-4 py-4 text-gray-600 text-sm">
                      <HighlightText text={lead.mobile || ''} highlight={debouncedSearch} />
                    </td>
                    <td className="px-4 py-4 text-gray-600 text-sm">
                      <HighlightText text={lead.city || lead.state || '-'} highlight={debouncedSearch} />
                    </td>
                    <td className="px-4 py-4 text-gray-600 text-sm">
                      <HighlightText text={lead.preferredCentreLocation || '-'} highlight={debouncedSearch} />
                    </td>
                    <td className="px-4 py-4">
                      <span className="capitalize text-sm text-gray-500">
                        <HighlightText text={sourceLabel(lead.source) || ''} highlight={debouncedSearch} />
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[lead.status] || 'bg-gray-100 text-gray-600'}`}>
                        {lead.status === 'new' ? 'Pending' : lead.status === 'not_interested' ? 'Dropped' : lead.status === 'meeting_scheduled' ? 'Meeting Scheduled' : lead.status === 'follow_up' ? 'Follow Up' : (lead.status || '').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => router.push(`/crm-admin/leads/${encodeURIComponent(lead.id)}`)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold transition-all"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 border-t border-gray-100 pt-6">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-widest">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total} leads
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 text-sm font-medium transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * 10 >= total}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 text-sm font-medium transition-all"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
