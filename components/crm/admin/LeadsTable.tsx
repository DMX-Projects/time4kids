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
  title?: string
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
  'new',
  'contacted',
  'called',
  'follow_up',
  'interested',
  'meeting_scheduled',
  'dropped',
  'not_interested',
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

export default function LeadsTable({ dateRange, city, centreId, status, source, title }: LeadsTableProps) {
  const router = useRouter()
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    loadLeads()
  }, [page, dateRange, city, centreId, status, source, search])

  const loadLeads = async () => {
    setLoading(true)
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
      if (search) params.append('search', search)

      const response = await api.get(`/leads?${params.toString()}`)
      setLeads(response.data.leads)
      setTotal(response.data.total)
    } catch (error) {
      console.error('Failed to load leads:', error)
      toast.error('Failed to load leads')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await api.patch(`/leads/${encodeURIComponent(leadId)}`, { status: newStatus })
      toast.success('Status updated successfully')
      loadLeads()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const sourceLabel = (source?: string) => SOURCE_LABELS[source || ''] || source?.replace('_', ' ') || 'Website'

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold text-gray-800">{title ?? 'Enquiry Reports'}</h3>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search leads..."
            className="form-input w-full sm:w-64 min-w-0"
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
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 text-nowrap">Source</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 font-medium text-gray-900">{lead.fullName}</td>
                    <td className="px-4 py-4 text-gray-600 text-sm">{lead.mobile}</td>
                    <td className="px-4 py-4">
                      <span className="capitalize text-sm text-gray-500">{sourceLabel(lead.source)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`status-badge ${statusColors[lead.status] || 'status-new'} border-0 cursor-pointer text-xs font-bold ring-0 focus:ring-0`}
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
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
