"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Building2,
  Flame,
  Shield,
  Home,
  MapPin,
  Phone,
  Users,
  AlertCircle,
  Loader2,
  RefreshCw,
  Clock,
} from "lucide-react";

import { DISASTER_OPTIONS } from "@/lib/disasterRules";

export interface VerifiedPlace {
  id: number;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  address?: string;
  phone?: string;
  disaster_types: string[];
  capacity?: number;
  verified: boolean;
  available: boolean;
  source: string;
  created_at: string;
  updated_at: string;
}

interface FormState {
  name: string;
  type: string;
  latitude: string;
  longitude: string;
  address: string;
  phone: string;
  disaster_types: string[];
  capacity: string;
  available: boolean;
  verified: boolean;
}

const INITIAL_FORM: FormState = {
  name: "",
  type: "hospital",
  latitude: "",
  longitude: "",
  address: "",
  phone: "",
  disaster_types: ["General Emergency"],
  capacity: "",
  available: true,
  verified: true,
};

export default function VerifiedPlacesAdminManager({
  onRefreshMap,
}: {
  onRefreshMap?: () => void;
}) {
  const [places, setPlaces] = useState<VerifiedPlace[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals & Form state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirmation
  const [deletingPlace, setDeletingPlace] = useState<VerifiedPlace | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchPlaces = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/emergency-places");
      const data = await res.json();

      if (res.ok && data.success) {
        setPlaces(data.places || []);
      } else {
        setError(
          data.error || "Failed to load emergency places from database.",
        );
      }
    } catch {
      setError("Network error while fetching emergency places.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (place: VerifiedPlace) => {
    setEditingId(place.id);
    setFormData({
      name: place.name,
      type: place.type,
      latitude: String(place.latitude),
      longitude: String(place.longitude),
      address: place.address || "",
      phone: place.phone || "",
      disaster_types: Array.isArray(place.disaster_types)
        ? place.disaster_types
        : ["General Emergency"],
      capacity: place.capacity ? String(place.capacity) : "",
      available: place.available !== false,
      verified: place.verified !== false,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleToggleDisasterType = (typeLabel: string) => {
    setFormData((prev) => {
      const exists = prev.disaster_types.includes(typeLabel);

      if (exists) {
        // Prevent empty array
        const updated = prev.disaster_types.filter((t) => t !== typeLabel);

        return {
          ...prev,
          disaster_types: updated.length > 0 ? updated : ["General Emergency"],
        };
      } else {
        return { ...prev, disaster_types: [...prev.disaster_types, typeLabel] };
      }
    });
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Frontend validation
    if (!formData.name.trim()) {
      setFormError("Facility name is required.");

      return;
    }

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setFormError("Latitude must be a valid number between -90 and 90.");

      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setFormError("Longitude must be a valid number between -180 and 180.");

      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        latitude: lat,
        longitude: lng,
        address: formData.address.trim() || null,
        phone: formData.phone.trim() || null,
        disaster_types: formData.disaster_types,
        capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
        available: formData.available,
        verified: formData.verified,
      };

      const url = editingId
        ? `/api/admin/emergency-places/${editingId}`
        : "/api/admin/emergency-places";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(
          editingId
            ? "Facility updated successfully in database."
            : "New verified emergency facility created in NeonDB.",
        );
        setIsModalOpen(false);
        fetchPlaces();
        if (onRefreshMap) onRefreshMap();
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setFormError(data.error || "Failed to save emergency place.");
      }
    } catch {
      setFormError("Network error while saving emergency place.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleVerifiedQuick = async (place: VerifiedPlace) => {
    try {
      const updatedVerified = !place.verified;
      const res = await fetch(`/api/admin/emergency-places/${place.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...place,
          verified: updatedVerified,
        }),
      });

      if (res.ok) {
        setPlaces((prev) =>
          prev.map((p) =>
            p.id === place.id ? { ...p, verified: updatedVerified } : p,
          ),
        );
        if (onRefreshMap) onRefreshMap();
      }
    } catch (err) {
      console.error("Toggle verified error:", err);
    }
  };

  const handleToggleAvailableQuick = async (place: VerifiedPlace) => {
    try {
      const updatedAvailable = !place.available;
      const res = await fetch(`/api/admin/emergency-places/${place.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...place,
          available: updatedAvailable,
        }),
      });

      if (res.ok) {
        setPlaces((prev) =>
          prev.map((p) =>
            p.id === place.id ? { ...p, available: updatedAvailable } : p,
          ),
        );
        if (onRefreshMap) onRefreshMap();
      }
    } catch (err) {
      console.error("Toggle available error:", err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPlace) return;
    setIsDeleting(true);

    try {
      const res = await fetch(
        `/api/admin/emergency-places/${deletingPlace.id}`,
        {
          method: "DELETE",
        },
      );
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(`"${deletingPlace.name}" deleted from NeonDB.`);
        setDeletingPlace(null);
        fetchPlaces();
        if (onRefreshMap) onRefreshMap();
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setError(data.error || "Failed to delete record.");
      }
    } catch {
      setError("Network error while deleting record.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case "hospital":
        return <Building2 className="text-rose-600" size={16} />;
      case "fire_station":
        return <Flame className="text-amber-600" size={16} />;
      case "police_station":
      case "police":
        return <Shield className="text-indigo-600" size={16} />;
      case "shelter":
      case "cooling_center":
        return <Home className="text-teal-600" size={16} />;
      default:
        return <Building2 className="text-slate-600" size={16} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-white p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Verified Emergency Places</span>
              <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs px-2.5 py-0.5 font-extrabold">
                NeonDB PostgreSQL
              </span>
            </h2>
            <p className="text-xs font-medium text-slate-600 mt-0.5">
              Manage trusted, admin-verified emergency facilities across all
              global locations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
            type="button"
            onClick={fetchPlaces}
          >
            <RefreshCw
              className={isLoading ? "animate-spin text-emerald-600" : ""}
              size={14}
            />
            <span>Refresh</span>
          </button>
          <button
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold transition-all cursor-pointer shadow-sm"
            type="button"
            onClick={handleOpenAddModal}
          >
            <Plus size={16} />
            <span>Add Emergency Place</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-900 animate-[fadeIn_0.2s_ease-out]">
          <CheckCircle2 className="text-emerald-600 shrink-0" size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-900">
          <AlertCircle className="text-rose-600 shrink-0" size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <Loader2 className="animate-spin text-emerald-600 mb-2" size={24} />
          <p className="text-xs font-bold text-slate-800">
            Loading verified emergency places...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && places.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <ShieldCheck className="mx-auto text-slate-300 mb-2" size={32} />
          <p className="text-xs font-bold text-slate-800">
            No verified emergency places in database
          </p>
          <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
            Click <strong>Add Emergency Place</strong> to create your first
            admin-verified facility in NeonDB.
          </p>
        </div>
      )}

      {/* Responsive Cards / Table Grid */}
      {!isLoading && places.length > 0 && (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((place) => (
            <div
              key={place.id}
              className={`flex flex-col justify-between rounded-2xl border p-4 transition-all bg-white shadow-2xs ${
                place.verified
                  ? "border-emerald-200 hover:border-emerald-400"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-200">
                      {getCategoryIcon(place.type)}
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        {place.type.replace("_", " ")}
                      </span>
                      <h4 className="text-xs font-black text-slate-900 leading-snug">
                        {place.name}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Edit facility"
                      type="button"
                      onClick={() => handleOpenEditModal(place)}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete facility"
                      type="button"
                      onClick={() => setDeletingPlace(place)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Status Toggles Bar */}
                <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px]">
                  <button
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold transition-all cursor-pointer ${
                      place.verified
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                    }`}
                    type="button"
                    onClick={() => handleToggleVerifiedQuick(place)}
                  >
                    {place.verified ? (
                      <>
                        <CheckCircle2 className="text-emerald-600" size={12} />
                        <span>✓ Admin Verified</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="text-slate-400" size={12} />
                        <span>○ Not Verified</span>
                      </>
                    )}
                  </button>

                  <button
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold transition-all cursor-pointer ${
                      place.available
                        ? "bg-teal-100 text-teal-800 border border-teal-200 hover:bg-teal-200"
                        : "bg-rose-100 text-rose-800 border border-rose-200 hover:bg-rose-200"
                    }`}
                    type="button"
                    onClick={() => handleToggleAvailableQuick(place)}
                  >
                    {place.available ? (
                      <span>Available ✓</span>
                    ) : (
                      <span>Currently Unavailable ✖</span>
                    )}
                  </button>
                </div>

                {/* Coordinates & Details */}
                <div className="mt-3 space-y-1.5 text-[11px] text-slate-600 border-t border-slate-100 pt-2.5">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700">
                    <MapPin className="text-slate-400 shrink-0" size={13} />
                    <span>
                      {Number(place.latitude).toFixed(5)}°,{" "}
                      {Number(place.longitude).toFixed(5)}°
                    </span>
                  </div>

                  {place.address && (
                    <p className="flex items-start gap-1.5 text-slate-600 line-clamp-2">
                      <span className="shrink-0 text-slate-400">📍</span>
                      <span>{place.address}</span>
                    </p>
                  )}

                  {place.phone && (
                    <p className="flex items-center gap-1.5 font-bold text-blue-600">
                      <Phone className="shrink-0" size={12} />
                      <span>{place.phone}</span>
                    </p>
                  )}

                  {place.capacity && (
                    <p className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Users className="shrink-0 text-slate-400" size={12} />
                      <span>Capacity: {place.capacity} persons</span>
                    </p>
                  )}
                </div>

                {/* Disaster Types Tags */}
                {Array.isArray(place.disaster_types) &&
                  place.disaster_types.length > 0 && (
                    <div className="mt-2.5 flex items-center gap-1 flex-wrap">
                      {place.disaster_types.map((dt) => (
                        <span
                          key={dt}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200"
                        >
                          {dt}
                        </span>
                      ))}
                    </div>
                  )}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  <span>
                    Updated:{" "}
                    {new Date(
                      place.updated_at || place.created_at,
                    ).toLocaleDateString()}
                  </span>
                </span>
                <span className="font-mono uppercase font-bold text-slate-400">
                  {place.source}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-[fadeIn_0.15s_ease-out]">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <ShieldCheck size={18} />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  {editingId
                    ? "Edit Verified Emergency Place"
                    : "Add Verified Emergency Place"}
                </h3>
              </div>
              <button
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                type="button"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-900">
                {formError}
              </div>
            )}

            <form className="space-y-3.5" onSubmit={handleSubmitForm}>
              {/* Name */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700">
                  Facility Name <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  placeholder="e.g., District General Emergency Hospital & Trauma Unit"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700">
                  Facility Type <span className="text-rose-500">*</span>
                </label>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none bg-white"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="hospital">Hospital / Medical Center</option>
                  <option value="fire_station">Fire & Rescue Station</option>
                  <option value="police_station">
                    Police Station / Control Room
                  </option>
                  <option value="shelter">Emergency Relief Shelter</option>
                  <option value="cooling_center">Cooling Center</option>
                  <option value="emergency_center">
                    Emergency Operation Center
                  </option>
                  <option value="other">Other Relief Facility</option>
                </select>
              </div>

              {/* Lat & Lng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700">
                    Latitude (-90 to 90){" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    placeholder="e.g., 11.3415"
                    step="any"
                    type="number"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700">
                    Longitude (-180 to 180){" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    placeholder="e.g., 77.7172"
                    step="any"
                    type="number"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700">
                  Address (Optional)
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  placeholder="Physical street address or landmark"
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>

              {/* Phone & Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700">
                    Helpline / Phone (Optional)
                  </label>
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    placeholder="e.g., +91 424 2258321 or 1077"
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700">
                    Capacity (Optional)
                  </label>
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    placeholder="e.g., 250"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Disaster Types Checkboxes */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Associated Disaster Relevance Types
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DISASTER_OPTIONS.map((opt) => {
                    const isChecked = formData.disaster_types.includes(
                      opt.label,
                    );

                    return (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-2 rounded-xl border p-2 text-xs font-bold cursor-pointer transition-all ${
                          isChecked
                            ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          checked={isChecked}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                          type="checkbox"
                          onChange={() => handleToggleDisasterType(opt.label)}
                        />
                        <span>{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Status Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-xs font-extrabold text-slate-900 cursor-pointer bg-slate-50">
                  <span>Admin Verified</span>
                  <input
                    checked={formData.verified}
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                    type="checkbox"
                    onChange={(e) =>
                      setFormData({ ...formData, verified: e.target.checked })
                    }
                  />
                </label>

                <label className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-xs font-extrabold text-slate-900 cursor-pointer bg-slate-50">
                  <span>Currently Available</span>
                  <input
                    checked={formData.available}
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                    type="checkbox"
                    onChange={(e) =>
                      setFormData({ ...formData, available: e.target.checked })
                    }
                  />
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      <span>Saving to NeonDB...</span>
                    </>
                  ) : (
                    <span>
                      {editingId ? "Update Facility" : "Create Verified Place"}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-[fadeIn_0.15s_ease-out]">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <Trash2 size={24} />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">
                Confirm Deletion
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Are you sure you want to delete{" "}
                <strong>&quot;{deletingPlace.name}&quot;</strong>? This will
                permanently remove the record from NeonDB.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                type="button"
                onClick={() => setDeletingPlace(null)}
              >
                Cancel
              </button>
              <button
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50"
                disabled={isDeleting}
                type="button"
                onClick={handleDeleteConfirm}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Record</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
