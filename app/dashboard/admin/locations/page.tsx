'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Building2, MapPin } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

interface FranchiseLocation {
    id?: number;
    city_name: string;
    state: string;
    state_display?: string;
    is_active: boolean;
    display_order: number;
}

export default function FranchiseLocationsPage() {
    const { authFetch } = useAuth();
    const { showToast } = useToast();
    const [locations, setLocations] = useState<FranchiseLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<FranchiseLocation>({
        city_name: '',
        state: 'DL',
        is_active: true,
        display_order: 0
    });

    const indianStates = [
        { code: 'AN', name: 'Andaman and Nicobar Islands' },
        { code: 'AP', name: 'Andhra Pradesh' },
        { code: 'AR', name: 'Arunachal Pradesh' },
        { code: 'AS', name: 'Assam' },
        { code: 'BR', name: 'Bihar' },
        { code: 'CH', name: 'Chandigarh' },
        { code: 'CT', name: 'Chhattisgarh' },
        { code: 'DN', name: 'Dadra and Nagar Haveli' },
        { code: 'DD', name: 'Daman and Diu' },
        { code: 'DL', name: 'Delhi' },
        { code: 'GA', name: 'Goa' },
        { code: 'GJ', name: 'Gujarat' },
        { code: 'HR', name: 'Haryana' },
        { code: 'HP', name: 'Himachal Pradesh' },
        { code: 'JK', name: 'Jammu and Kashmir' },
        { code: 'JH', name: 'Jharkhand' },
        { code: 'KA', name: 'Karnataka' },
        { code: 'KL', name: 'Kerala' },
        { code: 'LA', name: 'Ladakh' },
        { code: 'LD', name: 'Lakshadweep' },
        { code: 'MP', name: 'Madhya Pradesh' },
        { code: 'MH', name: 'Maharashtra' },
        { code: 'MN', name: 'Manipur' },
        { code: 'ML', name: 'Meghalaya' },
        { code: 'MZ', name: 'Mizoram' },
        { code: 'NL', name: 'Nagaland' },
        { code: 'OR', name: 'Odisha' },
        { code: 'PY', name: 'Puducherry' },
        { code: 'PB', name: 'Punjab' },
        { code: 'RJ', name: 'Rajasthan' },
        { code: 'SK', name: 'Sikkim' },
        { code: 'TN', name: 'Tamil Nadu' },
        { code: 'TG', name: 'Telangana' },
        { code: 'TR', name: 'Tripura' },
        { code: 'UP', name: 'Uttar Pradesh' },
        { code: 'UT', name: 'Uttarakhand' },
        { code: 'WB', name: 'West Bengal' },
    ];



    const router = useRouter();

    const fetchLocations = async () => {
        try {
            setLoading(true);
            const data = await authFetch<any>('/franchises/admin/franchise-locations/');
            const results = Array.isArray(data) ? data : (data.results || []);
            setLocations(results);
            setError(null);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch locations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);



    const handleCreate = async () => {
        if (!formData.city_name || !formData.state) {
            alert('Please fill all required location fields');
            return;
        }

        try {
            // 1. Create the location
            const locationResponse = await authFetch<any>('/franchises/admin/franchise-locations/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            showToast('Location created successfully!', 'success');

            await fetchLocations();

            setIsCreating(false);
            setFormData({
                city_name: '',
                state: 'DL',
                is_active: true,
                display_order: 0
            });


        } catch (err: any) {
            const errorMessage = err.message || 'Failed to create location';
            if (errorMessage.includes('UNIQUE constraint') || errorMessage.includes('city_name')) {
                showToast(`A location with the city name "${formData.city_name}" already exists.`, 'error');
            } else {
                showToast(errorMessage, 'error');
            }
        }
    };

    const handleUpdate = async (id: number) => {
        try {
            const locationToUpdate = locations.find(loc => loc.id === id);
            if (!locationToUpdate) return;

            await authFetch(`/franchises/admin/franchise-locations/${id}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(locationToUpdate)
            });

            await fetchLocations();
            setEditingId(null);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update location');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this location?')) return;

        try {
            await authFetch(`/franchises/admin/franchise-locations/${id}/`, {
                method: 'DELETE'
            });

            await fetchLocations();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete location');
        }
    };

    const updateLocation = (id: number, field: keyof FranchiseLocation, value: any) => {
        setLocations(locations.map(loc =>
            loc.id === id ? { ...loc, [field]: value } : loc
        ));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Franchise Locations Management</h1>
                <p className="text-gray-600">Manage cities where franchises are located. These appear on the home page city ladder and locate centre.</p>

                {/* Info Alert */}
                <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h3 className="text-sm font-semibold text-blue-800 mb-1">💡 How It Works</h3>
                            <p className="text-sm text-blue-700">
                                Cities listed here are shown on the website. Adding a location here makes it visible in "Our Presence" and "Locations" pages.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Location Button */}
            <div className="flex justify-end mb-6">
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                    <Plus className="w-5 h-5" />
                    Add Location
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {/* Create Form */}
            {isCreating && (
                <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-2 border-primary-100">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-primary-600" />
                        Add New Location
                    </h2>

                    {/* Location Part */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="col-span-1 md:col-span-2 lg:col-span-1">
                            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">City Name *</label>
                            <input
                                type="text"
                                value={formData.city_name}
                                onChange={(e) => setFormData({ ...formData, city_name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="e.g., Mumbai"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">State *</label>
                            <select
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                {indianStates.map(state => (
                                    <option key={state.code} value={state.code}>{state.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider">Order</label>
                            <input
                                type="number"
                                value={formData.display_order}
                                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex items-center pt-6">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer"
                                />
                                <span className="text-sm font-bold text-gray-700 uppercase tracking-wider group-hover:text-primary-600 transition-colors">Active</span>
                            </label>
                        </div>
                    </div>


                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                        >
                            <Save className="w-4 h-4" />
                            Save
                        </button>
                        <button
                            onClick={() => setIsCreating(false)}
                            className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Locations Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Table Header with Create Franchise Button */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Current Locations</h2>
                    <a
                        href="/dashboard/admin/manage-franchise"
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-sm"
                    >
                        <Building2 className="w-5 h-5" />
                        View Franchise
                    </a>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {locations.map((location) => (
                                <tr key={location.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingId === location.id ? (
                                            <input
                                                type="text"
                                                value={location.city_name}
                                                onChange={(e) => updateLocation(location.id!, 'city_name', e.target.value)}
                                                className="px-2 py-1 border border-gray-300 rounded w-full"
                                            />
                                        ) : (
                                            <span className="text-sm font-medium text-gray-900">{location.city_name}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingId === location.id ? (
                                            <select
                                                value={location.state}
                                                onChange={(e) => updateLocation(location.id!, 'state', e.target.value)}
                                                className="px-2 py-1 border border-gray-300 rounded w-full text-sm"
                                            >
                                                {indianStates.map(state => (
                                                    <option key={state.code} value={state.code}>{state.name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="text-sm text-gray-700">{location.state_display || location.state}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingId === location.id ? (
                                            <input
                                                type="number"
                                                value={location.display_order}
                                                onChange={(e) => updateLocation(location.id!, 'display_order', parseInt(e.target.value))}
                                                className="px-2 py-1 border border-gray-300 rounded w-20"
                                            />
                                        ) : (
                                            <span className="text-sm text-gray-600">{location.display_order}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingId === location.id ? (
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={location.is_active}
                                                    onChange={(e) => updateLocation(location.id!, 'is_active', e.target.checked)}
                                                    className="w-4 h-4 text-primary-600 rounded"
                                                />
                                                <span className="text-sm">Active</span>
                                            </label>
                                        ) : (
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${location.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {location.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {editingId === location.id ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleUpdate(location.id!)}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    <Save className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setEditingId(location.id!)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(location.id!)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 text-sm text-gray-600 px-6 pb-4">
                    Total Locations: {locations.length}
                </div>
            </div>
        </div>
    );
}
