'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { apiUrl, mediaUrl } from '@/lib/api-client';
import { Plus, Calendar, MapPin, Edit, Trash2, Image as ImageIcon, Loader } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useForm } from 'react-hook-form';
import EventMediaManager from '@/components/franchise/EventMediaManager';

interface Event {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date?: string;
    location: string;
    year: number;
    media: any[];
}

export default function ManageGallery() {
    const { tokens } = useAuth();
    const { showToast } = useToast();
    const token = tokens?.access;

    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [selectedEventForMedia, setSelectedEventForMedia] = useState<Event | null>(null);
    const [saving, setSaving] = useState(false);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    const fetchEvents = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const response = await fetch(apiUrl('/events/franchise/'), {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setEvents(data.results || data);
            } else {
                showToast('Failed to fetch events', 'error');
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            showToast('Error loading events', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [token]);

    const handleOpenModal = (event?: Event) => {
        if (event) {
            setEditingEvent(event);
            setValue('title', event.title);
            setValue('description', event.description);
            setValue('start_date', event.start_date);
            setValue('end_date', event.end_date || '');
            setValue('location', event.location);
        } else {
            setEditingEvent(null);
            reset({
                title: '',
                description: '',
                location: '',
                start_date: '',
                end_date: '',
            });
        }
        setIsModalOpen(true);
    };

    const onSubmit = async (data: any) => {
        if (!token) return;
        setSaving(true);
        try {
            const url = editingEvent
                ? apiUrl(`/events/franchise/${editingEvent.id}/`)
                : apiUrl('/events/franchise/');

            const method = editingEvent ? 'PATCH' : 'POST';

            const payload = {
                title: data.title,
                description: data.description,
                start_date: data.start_date,
                end_date: data.end_date || null,
                location: data.location,
            };

            const response = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                showToast(editingEvent ? 'Event updated!' : 'Event created!', 'success');
                setIsModalOpen(false);
                fetchEvents();
                reset();
            } else {
                const errorData = await response.json();
                showToast(errorData.detail || 'Failed to save event', 'error');
            }
        } catch (error) {
            console.error('Error saving event:', error);
            showToast('An error occurred', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteEvent = async (eventId: number) => {
        if (!token || !confirm('Are you sure you want to delete this event? All associated media will also be deleted.')) return;

        try {
            const response = await fetch(apiUrl(`/events/franchise/${eventId}/`), {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                showToast('Event deleted successfully', 'success');
                fetchEvents();
            } else {
                showToast('Failed to delete event', 'error');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            showToast('An error occurred', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    // If an event is selected for media management, show the media manager
    if (selectedEventForMedia) {
        return (
            <EventMediaManager
                event={selectedEventForMedia}
                onBack={() => {
                    setSelectedEventForMedia(null);
                    fetchEvents();
                }}
            />
        );
    }

    return (
        <div className="space-y-8 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-800">Events & Gallery</h1>
                    <p className="text-gray-500 mt-1">Manage events and upload photos/videos for your school gallery.</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="w-5 h-5 mr-2" /> Add Event
                </Button>
            </div>

            {events.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-bold text-gray-600 mb-2">No Events Yet</h3>
                    <p className="text-gray-500 mb-4">Create your first event to start adding photos and videos to your gallery.</p>
                    <Button onClick={() => handleOpenModal()}>
                        <Plus className="w-5 h-5 mr-2" /> Create Event
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden group"
                        >
                            {/* Event Thumbnail */}
                            <div
                                className="relative h-48 bg-gradient-to-br from-orange-100 to-yellow-100 cursor-pointer"
                                onClick={() => setSelectedEventForMedia(event)}
                            >
                                {event.media && event.media.length > 0 ? (
                                    <img
                                        src={mediaUrl(event.media[0].file)}
                                        alt={event.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <ImageIcon className="w-16 h-16 text-gray-300" />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm flex items-center gap-1">
                                    <ImageIcon className="w-3.5 h-3.5" />
                                    {event.media?.length || 0}
                                </div>
                            </div>

                            {/* Event Details */}
                            <div className="p-5">
                                <div className="flex items-center gap-2 text-sm text-orange-600 font-bold mb-2">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(event.start_date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
                                {event.description && (
                                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">{event.description}</p>
                                )}
                                {event.location && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {event.location}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-3 border-t border-gray-100">
                                    <button
                                        onClick={() => setSelectedEventForMedia(event)}
                                        className="flex-1 py-2 px-3 bg-orange-50 text-orange-600 rounded-lg font-semibold text-sm hover:bg-orange-100 transition-colors flex items-center justify-center gap-1"
                                    >
                                        <ImageIcon className="w-4 h-4" />
                                        Manage Media
                                    </button>
                                    <button
                                        onClick={() => handleOpenModal(event)}
                                        className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                        title="Edit Event"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteEvent(event.id)}
                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                        title="Delete Event"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Event Create/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEvent ? 'Edit Event' : 'Create Event'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Event Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('title', { required: 'Title is required' })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            placeholder="e.g., Annual Day 2024"
                        />
                        {errors.title && <p className="text-xs text-red-500">{String(errors.title.message)}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Description</label>
                        <textarea
                            {...register('description')}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            rows={3}
                            placeholder="Describe the event..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Start Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                {...register('start_date', { required: 'Start date is required' })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                            {errors.start_date && <p className="text-xs text-red-500">{String(errors.start_date.message)}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">End Date</label>
                            <input
                                type="date"
                                {...register('end_date')}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Location</label>
                        <input
                            {...register('location')}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            placeholder="Event location"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
