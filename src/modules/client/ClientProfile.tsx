import React, { useState } from "react";
import { Client } from "../../types/app";
import { User, Shield, Phone, Mail, Award, MapPin, Heart, Languages, Briefcase } from "lucide-react";
import { useTranslation } from "../../localization/hooks/useTranslation";
import { SmartDOBInput } from "../../components/SmartDOBInput";

interface ClientProfileProps {
  client: Client;
  onUpdate: (client: Client) => Promise<any>;
}

export const ClientProfile: React.FC<ClientProfileProps> = ({ client, onUpdate }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Client>({ ...client });
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setFormData({ ...client });
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(formData);
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving profile details:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/25 border border-slate-200 rounded-xl overflow-hidden">
      <div className="border-b border-slate-950 p-5 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            Client Identity Card
          </h3>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            CLIENT ID: {client.id.toUpperCase()} • DECOUPLED VEDA BIO RECORD
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-3.5 py-1.5 bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-750 text-[10px] font-mono font-bold text-emerald-400 rounded-lg transition-colors cursor-pointer"
        >
          {isEditing ? "CANCEL EDIT" : "EDIT PROFILE"}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Gender */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Gender</label>
              <select
                name="gender"
                value={formData.gender || "Male"}
                onChange={handleChange}
                className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Non-Binary">Non-Binary</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div className="col-span-1 sm:col-span-2">
              <SmartDOBInput
                value={formData.dob || ""}
                onChange={(val) => setFormData(prev => ({ ...prev, dob: val }))}
              />
            </div>

            {/* Birth Time */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Birth Time</label>
              <input
                type="time"
                name="birthTime"
                value={formData.birthTime || ""}
                onChange={handleChange}
                className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Birth Place */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Birth Place</label>
              <input
                type="text"
                name="birthPlace"
                value={formData.birthPlace || ""}
                onChange={handleChange}
                placeholder="City, Country"
                className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Occupation */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Occupation</label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation || ""}
                onChange={handleChange}
                className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Marital Status */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Marital Status</label>
              <select
                name="maritalStatus"
                value={formData.maritalStatus || "Single"}
                onChange={handleChange}
                className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>

            {/* Blood Group */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup || ""}
                onChange={handleChange}
                className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Emergency Contact</label>
              <input
                type="text"
                name="emergencyContact"
                value={formData.emergencyContact || ""}
                onChange={handleChange}
                placeholder="Name - Phone"
                className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
              />
            </div>

                        {/* Preferred Language */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Preferred Language</label>
              <select
                name="preferredLanguage"
                value={formData.preferredLanguage || "English"}
                onChange={handleChange}
                className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi / हिन्दी</option>
                <option value="Spanish">Spanish / Español</option>
                <option value="Sanskrit">Sanskrit / संस्कृतम्</option>
              </select>
            </div>

            {/* Report Language */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Report Language</label>
              <select
                name="reportLanguage"
                value={formData.reportLanguage || "English"}
                onChange={handleChange}
                className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi / हिन्दी</option>
              </select>
            </div>

            {/* Profile Photo URL */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Profile Photo URL</label>
              <input
                type="text"
                name="profilePhoto"
                value={formData.profilePhoto || ""}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* City */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">City</label>
              <input
                type="text"
                name="city"
                value={formData.city || ""}
                onChange={handleChange}
                className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* State */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">State</label>
              <input
                type="text"
                name="state"
                value={formData.state || ""}
                onChange={handleChange}
                className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Country */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country || ""}
                onChange={handleChange}
                className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Full Address */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Street Address</label>
            <input
              type="text"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              className="w-full bg-slate-50 text-xs text-slate-200 px-3 py-2 border border-slate-850 rounded focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Identity / Spiritual Profile Notes</label>
            <textarea
              name="notes"
              value={formData.notes || ""}
              onChange={handleChange}
              rows={3}
              placeholder="Spiritual alignment details, dietary parameters or overall notes..."
              className="w-full bg-slate-50 text-xs text-slate-200 p-3 border border-slate-850 rounded focus:outline-none focus:border-emerald-500 resize-none font-sans"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-mono text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              {loading ? "SAVING..." : "COMMIT CHANGES"}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Primary bio & image */}
          <div className="flex flex-col items-center justify-center text-center p-4 bg-slate-50/40 rounded-xl border border-slate-200/60">
            <div className="w-20 h-20 rounded-full bg-emerald-950/80 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 font-bold text-xl mb-3 shadow-md shadow-indigo-950/30">
              {client.avatarUrl || client.profilePhoto ? (
                <img 
                  src={client.avatarUrl || client.profilePhoto} 
                  alt={client.name} 
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>{client.name ? client.name.charAt(0).toUpperCase() : "?"}</span>
              )}
            </div>
            <h4 className="text-sm font-bold text-slate-900">{client.name}</h4>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider">
              {client.occupation || "Consultant Customer"}
            </p>
            <div className="mt-4 flex flex-col gap-1.5 w-full text-xs text-slate-700">
              <div className="flex items-center justify-center gap-1.5 text-slate-400">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate max-w-[180px]">{client.email}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-slate-400">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{client.phone}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Astro & Bio Data */}
          <div className="space-y-4 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2.5 p-4 bg-slate-50/20 border border-slate-200/60 rounded-xl">
              <h5 className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest border-b border-slate-200/60 pb-1 font-bold">
                Cosmic Alignment Factors
              </h5>
              <div className="space-y-1.5 text-xs text-slate-700 font-mono">
                <p className="flex justify-between">
                  <span className="text-slate-400">GENDER:</span>
                  <span className="text-slate-200 font-medium">{client.gender || "Not Specified"}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">DATE OF BIRTH:</span>
                  <span className="text-slate-200 font-medium">{client.dob || "Not Configured"}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">BIRTH TIME:</span>
                  <span className="text-slate-200 font-medium">{client.birthTime || "Not Configured"}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">BIRTH PLACE:</span>
                  <span className="text-slate-200 font-medium truncate max-w-[140px] text-right">{client.birthPlace || "Not Configured"}</span>
                </p>
              </div>
            </div>

            <div className="space-y-2.5 p-4 bg-slate-50/20 border border-slate-200/60 rounded-xl">
              <h5 className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest border-b border-slate-200/60 pb-1 font-bold">
                Medical & Preference Records
              </h5>
              <div className="space-y-1.5 text-xs text-slate-700 font-mono">
                <p className="flex justify-between">
                  <span className="text-slate-400">BLOOD GROUP:</span>
                  <span className="text-slate-200 font-medium">{client.bloodGroup || "Not Checked"}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">MARITAL STATUS:</span>
                  <span className="text-slate-200 font-medium">{client.maritalStatus || "Single"}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">LANG PREFERENCE:</span>
                  <span className="text-emerald-300 font-medium">{client.preferredLanguage || "English"}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">REPORT LANG:</span>
                  <span className="text-emerald-300 font-medium">{client.reportLanguage || "English"}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">EMERGENCY NO:</span>
                  <span className="text-slate-200 font-medium">{client.emergencyContact || "No Guard"}</span>
                </p>
              </div>
            </div>

            <div className="sm:col-span-2 space-y-2 p-4 bg-slate-50/20 border border-slate-200/60 rounded-xl">
              <h5 className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest border-b border-slate-200/60 pb-1 font-bold">
                Residential & Physical Address
              </h5>
              <p className="text-xs text-slate-700 flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  {client.address ? (
                    `${client.address}${client.city ? `, ${client.city}` : ""}${client.state ? `, ${client.state}` : ""}${client.country ? `, ${client.country}` : ""}`
                  ) : (
                    "No street address logged. Please edit profile to configure."
                  )}
                </span>
              </p>
            </div>

            {client.notes && (
              <div className="sm:col-span-2 p-4 bg-slate-50/20 border border-slate-200/60 rounded-xl">
                <h5 className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest border-b border-slate-200/60 pb-1 font-bold mb-1.5">
                  Spiritual Biography Summary
                </h5>
                <p className="text-xs text-slate-700 italic leading-relaxed font-sans">{client.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default ClientProfile;
