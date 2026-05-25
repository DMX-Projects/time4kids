'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, MapPin, Plus, RefreshCw, Search } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { comparePresenceCities } from '@/lib/site-location-presence';

type FranchiseCityRow = {
    id: string;
    city_name: string;
    city?: string;
    state: string;
    state_display?: string;
    franchise_count: number;
};

export default function FranchiseLocationsPage() {
    const { authFetch } = useAuth();
    const [locations, setLocations] = useState<FranchiseCityRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const fetchLocations = useCallback(async () => {
        try {
            setLoading(true);
            const data = await authFetch<FranchiseCityRow[] | { results?: FranchiseCityRow[] }>(
                '/franchises/public/locations/',
            );
            const results = Array.isArray(data) ? data : (data.results || []);
            const sorted = [...results].sort((a, b) =>
                comparePresenceCities(a.city_name || a.city || '', b.city_name || b.city || ''),
            );
            setLocations(
                sorted.map((row) => ({
                    ...row,
                    city_name: row.city_name || row.city || '',
                    franchise_count: row.franchise_count ?? 0,
                })),
            );
            setError(null);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch cities from franchise table');
            setLocations([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        fetchLocations();
    }, [fetchLocations]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return locations;
        return locations.filter((loc) => {
            const city = (loc.city_name || '').toLowerCase();
            const state = (loc.state_display || loc.state || '').toLowerCase();
            return city.includes(q) || state.includes(q);
        });
    }, [locations, search]);

    const totalCentres = useMemo(
        () => filtered.reduce((sum, loc) => sum + (loc.franchise_count || 0), 0),
        [filtered],
    );

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8">
            <div className="mb-6">
                <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold text-gray-900">
                    <MapPin className="h-8 w-8 text-orange-500" />
                    Cities (franchise table)
                </h1>
                <p className="text-gray-600">
                    Distinct <strong>city</strong> values from active rows in the <strong>franchise</strong> table. This
                    list powers the homepage Our Presence strip, Locate a Centre, and{' '}
                    <code className="rounded bg-gray-100 px-1 text-sm">/locations</code>.
                </p>
            </div>

            <div className="mb-6 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                    <strong>To add or change a city:</strong> add a centre or edit an existing centre&apos;s{' '}
                    <strong>City</strong> field under{' '}
                    <Link href="/dashboard/admin/add-franchise" className="font-semibold underline">
                        Add franchise
                    </Link>{' '}
                    or{' '}
                    <Link href="/dashboard/admin/manage-franchise" className="font-semibold underline">
                        Manage franchise
                    </Link>
                    . Cities appear here automatically when at least one active centre uses that city.
                </p>
            </div>

            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
            )}

            <div className="overflow-hidden rounded-lg bg-white shadow-md">
                <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Cities on site</h2>
                        <p className="text-sm text-gray-500">
                            {filtered.length} cities · {totalCentres} centres
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search city or state…"
                                className="w-full min-w-[200px] rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 sm:w-56"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => fetchLocations()}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                        <Link
                            href="/dashboard/admin/add-franchise"
                            className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-700"
                        >
                            <Plus className="h-4 w-4" />
                            Add centre
                        </Link>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    #
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    City (franchise.city)
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    State
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Centres
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                                        {search ? 'No cities match your search.' : 'No active centres with a city yet.'}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((location, index) => (
                                    <tr key={location.id || location.city_name} className="hover:bg-gray-50">
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">{index + 1}</td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span className="text-sm font-semibold text-gray-900">{location.city_name}</span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                                            {location.state_display || location.state || '—'}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-800">
                                                {location.franchise_count}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                            <Link
                                                href={`/dashboard/admin/manage-franchise?city=${encodeURIComponent(location.city_name)}`}
                                                className="inline-flex items-center gap-1 font-medium text-orange-600 hover:text-orange-800"
                                            >
                                                <Building2 className="h-4 w-4" />
                                                View centres
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
