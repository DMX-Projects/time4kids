'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/crmApi'
import { toast } from 'react-hot-toast'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface LeadsTableProps {
  dateRange: { startDate: Date | null; endDate: Date | null }
  city?: string
  state?: string
  centreId?: string
  status?: string
  source?: string
  search?: string
  title?: string
  returnHref?: string
  onBeforeNavigate?: () => void
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
  july_lp: 'Landingpage July',
  july_meta: 'Meta July',
  lp_wb: 'Landingpage-WB',
  admission: 'Admission',
  contact: 'Centers Enquiry',
  campaign: 'Campaign Enquiry',
  landing: 'Landing Lead',
  franchise: 'Franchise',
}

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

const statusColors: { [key: string]: string } = {
  untouched: 'bg-gray-100 text-gray-700 border border-gray-200',
  not_answering: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  follow_up: 'bg-blue-100 text-blue-700 border border-blue-200',
  visited_school: 'bg-teal-100 text-teal-700 border border-teal-200',
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
  interested: 'bg-blue-100 text-blue-700 border border-blue-200',
  meeting_scheduled: 'bg-teal-100 text-teal-700 border border-teal-200',
}

export default function LeadsTable({ dateRange, city, state, centreId, status, source, search, title, returnHref, onBeforeNavigate, onLeadUpdated }: LeadsTableProps) {
  const hideCentreColumn =
    source === 'franchise' || source === 'july_lp' || source === 'july_meta' || source === 'lp_wb'
  const isFranchiseCampaignLead = (leadSource: string) =>
    leadSource === 'july_lp' || leadSource === 'july_meta' || leadSource === 'lp_wb'
  const router = useRouter()
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const [leads, setLeads] = useState<any[]>([])

  const openLead = (leadId: string) => {
    onBeforeNavigate?.()
    const base = `/crm-admin/leads/${encodeURIComponent(leadId)}`
    const href = returnHref
      ? `${base}?from=${encodeURIComponent(returnHref)}`
      : base
    router.push(href)
  }

  const scrollTable = (direction: 'left' | 'right') => {
    if (tableContainerRef.current) {
      const scrollAmount = 250;
      tableContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  }
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 350)
    return () => clearTimeout(t)
  }, [searchTerm])

  useEffect(() => {
    setPage(1)
  }, [pageSize])

  useEffect(() => {
    loadLeads()
  }, [page, pageSize, dateRange, city, state, centreId, status, source, debouncedSearch])

  const loadLeads = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
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
      if (state) params.append('state', state)
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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—'
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return '—'
    }
  }

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '—'
    try {
      const d = new Date(dateStr)
      return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch {
      return '—'
    }
  }

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
          {/* Mobile Scroll Indicator & Control Buttons */}
          <div className="lg:hidden flex items-center justify-between px-2 py-2 bg-gray-50 rounded-xl mb-3 border border-gray-200 text-xs">
            <span className="text-gray-500 font-medium pl-1.5">
              Scroll table horizontally to view all columns
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => scrollTable('left')}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-500 shadow-sm active:bg-gray-100 focus:outline-none"
                aria-label="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollTable('right')}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-500 shadow-sm active:bg-gray-100 focus:outline-none"
                aria-label="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div ref={tableContainerRef} className="overflow-x-auto overflow-y-visible">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 sticky left-0 bg-gray-100 z-20 border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">State</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">City</th>
                  {!hideCentreColumn && (
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">Centre</th>
                  )}
                  {source === 'admission' && (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 text-nowrap">Child Name</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 text-nowrap">Child Age</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 text-nowrap">Program</th>
                    </>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 text-nowrap">Source</th>
                  {source === 'franchise' && (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 text-nowrap">Registration Date</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 text-nowrap">Last User Activity</th>
                    </>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className={`group hover:bg-gray-50 transition-colors ${updatingId === lead.id ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-4 font-medium text-gray-900 sticky left-0 bg-white group-hover:bg-gray-50 z-10 border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      <HighlightText text={lead.fullName || ''} highlight={debouncedSearch} />
                    </td>
                    <td className="px-4 py-4 text-gray-600 text-sm">
                      <HighlightText text={lead.mobile || ''} highlight={debouncedSearch} />
                    </td>
                    <td className="px-4 py-4 text-gray-600 text-sm">
                      <HighlightText text={lead.state || '-'} highlight={debouncedSearch} />
                    </td>
                    <td className="px-4 py-4 text-gray-600 text-sm">
                      <HighlightText text={lead.city || '-'} highlight={debouncedSearch} />
                    </td>
                    {!hideCentreColumn && (
                      <td className="px-4 py-4 text-gray-600 text-sm">
                        {isFranchiseCampaignLead(lead.source) ? (
                          '—'
                        ) : (
                          <HighlightText text={lead.preferredCentreLocation || '-'} highlight={debouncedSearch} />
                        )}
                      </td>
                    )}
                    {source === 'admission' && (() => {
                      const msg = lead.comments || '';
                      const child = msg.match(/Child:\s*([^,\|]+)/i)?.[1]?.trim() || '—';
                      const age = lead.childAge || msg.match(/Age:\s*([^,\|]+)/i)?.[1]?.trim() || '—';
                      const program = msg.match(/Program:\s*([^,\|]+)/i)?.[1]?.trim() || '—';
                      return (
                        <>
                          <td className="px-4 py-4 text-gray-600 text-sm">{child}</td>
                          <td className="px-4 py-4 text-gray-600 text-sm">{age}</td>
                          <td className="px-4 py-4 text-gray-600 text-sm">{program}</td>
                        </>
                      );
                    })()}
                    <td className="px-4 py-4">
                      <span className="capitalize text-sm text-gray-500">
                        <HighlightText text={sourceLabel(lead.source) || ''} highlight={debouncedSearch} />
                      </span>
                    </td>
                    {source === 'franchise' && (
                      <>
                        <td className="px-4 py-4 text-gray-600 text-sm whitespace-nowrap">
                          {formatDate(lead.createdAt)}
                        </td>
                        <td className="px-4 py-4 text-gray-600 text-sm whitespace-nowrap">
                          {formatDateTime(lead.updatedAt)}
                        </td>
                      </>
                    )}
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[lead.status] || 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[lead.status] || (lead.status || '').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => openLead(lead.id)}
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
          {(() => {
            const totalPages = Math.ceil(total / pageSize);
            
            const getPageNumbers = () => {
              const items: (number | string)[] = [];
              if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) items.push(i);
              } else {
                if (page <= 4) {
                  items.push(1, 2, 3, 4, 5, "...", totalPages);
                } else if (page >= totalPages - 3) {
                  items.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                } else {
                  items.push(1, "...", page - 1, page, page + 1, "...", totalPages);
                }
              }
              return items;
            };

            return (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 border-t border-gray-100 pt-6 text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                    Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} leads
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-gray-400 uppercase tracking-widest font-medium">Show:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-gray-700"
                    >
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-2.5 py-1.5 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 text-xs font-medium transition-all"
                  >
                    Prev
                  </button>

                  {getPageNumbers().map((item, idx) => (
                    item === "..." ? (
                      <span key={`dots-${idx}`} className="px-2 py-1 text-gray-400">...</span>
                    ) : (
                      <button
                        key={`page-${item}`}
                        type="button"
                        onClick={() => setPage(Number(item))}
                        className={`px-3 py-1.5 rounded border text-xs font-medium transition-all ${
                          page === item
                            ? "bg-blue-600 text-white border-blue-600 font-bold"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  ))}

                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                    className="px-2.5 py-1.5 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 text-xs font-medium transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            );
          })()}
        </>
      )}
    </div>
  )
}
