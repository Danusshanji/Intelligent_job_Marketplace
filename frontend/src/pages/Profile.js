import { useState, useRef, useEffect } from "react";
import { getProfile, updateProfile, uploadResume } from '../services/api';
const EMPTY_PROFILE = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  phone: "",
  location: "",
  bio: "",
  skills: [],
  education: "",
  experience: "",
  profilePic: null,
  role: "",
  applications: 0,
  resumeName: null,
};

const SKILL_COLORS = [
  { bg: "#ede9fe", color: "#6d28d9", border: "#c4b5fd" },
  { bg: "#fce7f3", color: "#9d174d", border: "#f9a8d4" },
  { bg: "#d1fae5", color: "#065f46", border: "#6ee7b7" },
  { bg: "#fff7ed", color: "#9a3412", border: "#fdba74" },
  { bg: "#dbeafe", color: "#1e40af", border: "#93c5fd" },
  { bg: "#fef9c3", color: "#854d0e", border: "#fde047" },
];

// Calculate profile completion based on filled fields
function calcCompletion(p) {
  const fields = [
    p.firstName, p.lastName, p.phone, p.location,
    p.bio, p.education, p.experience,
  ];
  const filled = fields.filter(f => f && f.trim() !== "").length;
  const skillsScore = p.skills.length > 0 ? 1 : 0;
  const resumeScore = p.resumeName ? 1 : 0;
  const total = fields.length + 2; // +2 for skills and resume
  return Math.round(((filled + skillsScore + resumeScore) / total) * 100);
}

function SkillBadge({ skill, editable, onRemove, colorIndex }) {
  const c = SKILL_COLORS[colorIndex % SKILL_COLORS.length];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      background: c.bg, color: c.color,
      border: `1px solid ${c.border}`, borderRadius: "8px",
      padding: "6px 14px", fontSize: "13px", fontWeight: 600,
    }}>
      {skill}
      {editable && (
        <button onClick={() => onRemove(skill)} style={{
          background: "none", border: "none", cursor: "pointer",
          color: c.color, fontSize: "16px", lineHeight: 1, padding: "0", opacity: 0.6
        }}>×</button>
      )}
    </span>
  );
}

function StatCard({ label, value, bg }) {
  return (
    <div style={{
      background: bg, borderRadius: "16px",
      padding: "22px 24px", flex: 1, minWidth: "140px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    }}>
      <div style={{
        fontSize: "12px", color: "rgba(255,255,255,0.8)",
        fontWeight: 700, marginBottom: "10px",
        textTransform: "uppercase", letterSpacing: "0.07em"
      }}>{label}</div>
      <div style={{ fontSize: "26px", fontWeight: 800, color: "#fff" }}>
        {value !== undefined && value !== null && value !== "" ? value : "—"}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 14px",
  border: "2px solid #e8eaf6", borderRadius: "10px",
  fontSize: "14px", color: "#1a237e", background: "#fff",
  outline: "none", boxSizing: "border-box", fontFamily: "inherit",
};

const btnPrimary = {
  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
  color: "#fff", border: "none", borderRadius: "10px",
  padding: "10px 24px", fontSize: "14px",
  fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
  boxShadow: "0 4px 14px rgba(79,70,229,0.4)",
};

const btnSecondary = {
  background: "#fff", color: "#4f46e5",
  border: "2px solid #e0e7ff", borderRadius: "10px",
  padding: "10px 20px", fontSize: "14px",
  fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
};

function SectionCard({ title, accent, children }) {
  return (
    <div style={{
      background: "#fff", borderRadius: "18px",
      boxShadow: "0 2px 16px rgba(79,70,229,0.07)",
      overflow: "hidden", border: "1px solid #ede9fe",
    }}>
      <div style={{
        padding: "14px 24px",
        background: `linear-gradient(135deg, ${accent}18, ${accent}08)`,
        borderBottom: `3px solid ${accent}`,
        display: "flex", alignItems: "center", gap: "10px"
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: accent, boxShadow: `0 0 6px ${accent}`
        }} />
        <h3 style={{
          margin: 0, fontSize: "13px", fontWeight: 800,
          color: "#1e1b4b", textTransform: "uppercase", letterSpacing: "0.08em"
        }}>{title}</h3>
      </div>
      <div style={{ padding: "24px" }}>{children}</div>
    </div>
  );
}

function Field({ label, value, editing, onChange, type = "input", placeholder = "" }) {
  return (
    <div>
      <label style={{
        display: "block", fontSize: "11px", fontWeight: 800,
        color: "#7c3aed", marginBottom: "7px",
        textTransform: "uppercase", letterSpacing: "0.08em"
      }}>{label}</label>
      {editing ? (
        type === "textarea" ? (
          <textarea value={value} onChange={e => onChange(e.target.value)}
            rows={4} placeholder={placeholder}
            style={{ ...inputStyle, resize: "vertical" }} />
        ) : (
          <input value={value} onChange={e => onChange(e.target.value)}
            placeholder={placeholder} style={inputStyle} />
        )
      ) : (
        <p style={{
          margin: 0, fontSize: "14px",
          color: value ? "#374151" : "#9ca3af",
          lineHeight: 1.7, fontWeight: 500,
          padding: "8px 0", borderBottom: "1px dashed #e8eaf6",
          fontStyle: value ? "normal" : "italic"
        }}>{value || "Not provided"}</p>
      )}
    </div>
  );
}

export default function Profile() {
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [draft, setDraft] = useState(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [picPreview, setPicPreview] = useState(null);
  const [picFile, setPicFile] = useState(null);
  const [resumeName, setResumeName] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef();
  const resumeInputRef = useRef();

  useEffect(() => {
  const fetchProfile = async () => {
    try {
      const response = await getProfile();
      const data = response.data;
      const mapped = {
        firstName: data.first_name || "",
        lastName: data.last_name || "",
        username: data.username || "",
        email: data.email || "",
        phone: data.phone || "",
        location: data.location || "",
        bio: data.bio || "",
        skills: data.skills || [],
        education: data.education || "",
        experience: data.experience || "",
        profilePic: data.profile_pic_url || null,
        role: data.role || "",
        applications: data.applications_count || 0,
        resumeName: data.resume_name || null,
      };
      setProfile(mapped);
      setDraft(mapped);
      if (mapped.resumeName) setResumeName(mapped.resumeName);
    } catch (err) {
      setError("Could not load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  fetchProfile();
}, []);
  const handleEdit = () => {
    setDraft({ ...profile });
    setEditing(true);
    setSaved(false);
  };

  const handleCancel = () => {
    setEditing(false);
    setPicPreview(null);
    setPicFile(null);
  };

  const handleSave = async () => {
  setSaving(true);
  try {
    const formData = new FormData();
    formData.append("first_name", draft.firstName);
    formData.append("last_name", draft.lastName);
    formData.append("phone", draft.phone);
    formData.append("location", draft.location);
    formData.append("bio", draft.bio);
    formData.append("skills", JSON.stringify(draft.skills));
    formData.append("education", draft.education);
    formData.append("experience", draft.experience);
    if (picFile) formData.append("profile_pic", picFile);

    await updateProfile(formData);

    const updatedProfile = {
      ...draft,
      profilePic: picPreview || profile.profilePic,
      resumeName: resumeName,
    };
    setProfile(updatedProfile);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  } catch (err) {
    setError("Failed to save. Please try again.");
  } finally {
    setSaving(false);
  }
};

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPicFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPicPreview(reader.result);
    reader.readAsDataURL(file);
  };
const handleResumeChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.type !== "application/pdf") { alert("Only PDF files are accepted."); return; }
  if (file.size > 5 * 1024 * 1024) { alert("File size must be under 5MB."); return; }
  setResumeName(file.name);
  setResumeUploading(true);
  setResumeUploaded(false);
  try {
    const formData = new FormData();
    formData.append("resume", file);
    await uploadResume(formData);
    setResumeUploaded(true);
    setTimeout(() => setResumeUploaded(false), 4000);
  } catch (err) {
    alert("Resume upload failed. Please try again.");
    setResumeName(null);
  } finally {
    setResumeUploading(false);
  }
};
  const handleRemoveResume = () => {
    setResumeName(null);
    setResumeUploaded(false);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const s = newSkill.trim();
    if (s && !draft.skills.includes(s))
      setDraft(d => ({ ...d, skills: [...d.skills, s] }));
    setNewSkill("");
  };

  const handleRemoveSkill = (skill) =>
    setDraft(d => ({ ...d, skills: d.skills.filter(s => s !== skill) }));

  const currentPic = picPreview || profile.profilePic;
  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.username || "New User";
  const initials = displayName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  // Calculate completion live from actual profile data
  const pct = calcCompletion({ ...profile, resumeName });

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(160deg, #f5f3ff 0%, #ede9fe 30%, #e0f2fe 70%, #f0fdf4 100%)"
      }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            border: "4px solid #ede9fe", borderTop: "4px solid #7c3aed",
            animation: "spin 0.8s linear infinite", margin: "0 auto 16px"
          }} />
          <p style={{ color: "#7c3aed", fontWeight: 700, fontSize: "15px", margin: 0 }}>
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #f5f3ff 0%, #ede9fe 30%, #e0f2fe 70%, #f0fdf4 100%)",
      fontFamily: "'Segoe UI', 'Inter', sans-serif",
      padding: "36px 20px 72px",
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .profile-section { animation: fadeIn 0.4s ease forwards; }
        input:focus, textarea:focus { border-color: #7c3aed !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.12); }
      `}</style>

      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Page Title */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{
            fontSize: "28px", fontWeight: 900, margin: "0 0 4px",
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>My Profile</h1>
          <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>
            Manage your personal and professional information
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626",
            borderRadius: "12px", padding: "13px 20px", marginBottom: "20px",
            fontWeight: 600, fontSize: "14px",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            {error}
            <button onClick={() => setError("")} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#dc2626", fontSize: "20px", lineHeight: 1
            }}>×</button>
          </div>
        )}

        {/* Success Banner */}
        {saved && (
          <div style={{
            background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
            border: "1px solid #6ee7b7", color: "#065f46",
            borderRadius: "12px", padding: "13px 20px", marginBottom: "20px",
            fontWeight: 700, fontSize: "14px",
          }}>
            Profile updated successfully.
          </div>
        )}

        {/* Incomplete Profile Warning */}
        {!editing && pct < 50 && (
          <div style={{
            background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
            border: "1px solid #fcd34d", color: "#92400e",
            borderRadius: "12px", padding: "14px 20px", marginBottom: "20px",
            fontWeight: 600, fontSize: "14px",
            display: "flex", justifyContent: "space-between",
            alignItems: "center", flexWrap: "wrap", gap: "10px"
          }}>
            <span>Your profile is incomplete. Add your details to get better job matches.</span>
            <button onClick={handleEdit} style={{
              background: "#d97706", color: "#fff", border: "none",
              borderRadius: "8px", padding: "8px 18px",
              fontSize: "13px", fontWeight: 700, cursor: "pointer"
            }}>Complete Now</button>
          </div>
        )}

        {/* Profile Card */}
        <div className="profile-section" style={{
          borderRadius: "24px", overflow: "hidden", marginBottom: "22px",
          boxShadow: "0 8px 32px rgba(79,70,229,0.15)",
        }}>
          {/* Banner */}
          <div style={{
            height: "130px",
            background: "linear-gradient(135deg, #312e81 0%, #4f46e5 45%, #7c3aed 75%, #a855f7 100%)",
            position: "relative", overflow: "hidden"
          }}>
            <div style={{ position: "absolute", top: -30, right: -30, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
            <div style={{ position: "absolute", bottom: -20, left: 80, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
            <span style={{
              position: "absolute", top: 16, right: 20,
              background: "rgba(255,255,255,0.18)", color: "#fff",
              borderRadius: "8px", padding: "5px 14px",
              fontSize: "12px", fontWeight: 700,
              border: "1px solid rgba(255,255,255,0.25)",
            }}>{profile.role || "User"}</span>
          </div>

          {/* Body */}
          <div style={{ background: "#fff", padding: "0 30px 28px" }}>
            {/* Avatar */}
            <div style={{ marginTop: "-52px", marginBottom: "16px", position: "relative", display: "inline-block" }}>
              {currentPic ? (
                <img src={currentPic} alt="Profile" style={{
                  width: 100, height: 100, borderRadius: "50%",
                  objectFit: "cover", border: "4px solid #fff",
                  boxShadow: "0 4px 20px rgba(79,70,229,0.25)", display: "block"
                }} />
              ) : (
                <div style={{
                  width: 100, height: 100, borderRadius: "50%",
                  background: "linear-gradient(135deg, #4f46e5, #7c3aed, #a855f7)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "32px", fontWeight: 900, color: "#fff",
                  border: "4px solid #fff",
                  boxShadow: "0 4px 20px rgba(79,70,229,0.3)"
                }}>{initials}</div>
              )}
              {editing && (
                <>
                  <button onClick={() => fileInputRef.current.click()} style={{
                    position: "absolute", bottom: 4, right: 4,
                    width: 30, height: 30, borderRadius: "50%",
                    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                    border: "2px solid #fff", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(79,70,229,0.4)"
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*"
                    onChange={handleImageChange} style={{ display: "none" }} />
                </>
              )}
            </div>

            {/* Name + buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
              <div style={{ flex: 1 }}>
                {editing ? (
                  <div style={{ display: "flex", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                    <input
                      value={draft.firstName}
                      onChange={e => setDraft(d => ({ ...d, firstName: e.target.value }))}
                      placeholder="First Name"
                      style={{ ...inputStyle, flex: 1, minWidth: "140px", fontSize: "16px", fontWeight: 700 }}
                    />
                    <input
                      value={draft.lastName}
                      onChange={e => setDraft(d => ({ ...d, lastName: e.target.value }))}
                      placeholder="Last Name"
                      style={{ ...inputStyle, flex: 1, minWidth: "140px", fontSize: "16px", fontWeight: 700 }}
                    />
                  </div>
                ) : (
                  <h2 style={{ margin: "0 0 5px", fontSize: "22px", fontWeight: 900, color: "#1e1b4b" }}>
                    {displayName}
                  </h2>
                )}
                <p style={{ margin: 0, color: "#6b7280", fontSize: "13.5px" }}>
                  {profile.location || "Location not set"} &nbsp;&middot;&nbsp; {profile.email || "No email"}
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                {editing ? (
                  <>
                    <button onClick={handleCancel} style={btnSecondary}>Cancel</button>
                    <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.8 : 1 }}>
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                ) : (
                  <button onClick={handleEdit} style={btnPrimary}>Edit Profile</button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginTop: "22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px" }}>
                <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>Profile Completeness</span>
                <span style={{ fontSize: "12px", color: "#7c3aed", fontWeight: 800 }}>{pct}%</span>
              </div>
              <div style={{ background: "#ede9fe", borderRadius: "999px", height: "8px" }}>
                <div style={{
                  width: `${pct}%`, height: "100%",
                  background: "linear-gradient(90deg, #4f46e5, #a855f7)",
                  borderRadius: "999px",
                  boxShadow: "0 0 8px rgba(124,58,237,0.5)",
                  transition: "width 0.6s ease"
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Stat Cards — now calculated from local state */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "22px" }}>
          <StatCard
            label="Applications Sent"
            value={profile.applications > 0 ? profile.applications : "0"}
            bg="linear-gradient(135deg, #4f46e5, #6366f1)"
          />
          <StatCard
            label="Profile Score"
            value={`${pct}%`}
            bg="linear-gradient(135deg, #d97706, #f59e0b)"
          />
          <StatCard
            label="Account Type"
            value={profile.role}
            bg="linear-gradient(135deg, #059669, #10b981)"
          />
        </div>

        {/* Sections */}
        <div style={{ display: "grid", gap: "18px" }}>

          {/* Contact */}
          <SectionCard title="Contact Information" accent="#4f46e5">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
              <Field label="Email Address" editing={editing}
                value={editing ? draft.email : profile.email}
                onChange={v => setDraft(d => ({ ...d, email: v }))} />
              <Field label="Phone Number" editing={editing}
                value={editing ? draft.phone : profile.phone}
                onChange={v => setDraft(d => ({ ...d, phone: v }))}
                placeholder="e.g. +91 98765 43210" />
              <Field label="Location" editing={editing}
                value={editing ? draft.location : profile.location}
                onChange={v => setDraft(d => ({ ...d, location: v }))}
                placeholder="e.g. Belagavi, Karnataka" />
            </div>
          </SectionCard>

          {/* About */}
          <SectionCard title="About" accent="#7c3aed">
            <Field label="Bio" editing={editing} type="textarea"
              value={editing ? draft.bio : profile.bio}
              onChange={v => setDraft(d => ({ ...d, bio: v }))}
              placeholder="Tell employers about yourself..." />
          </SectionCard>

          {/* Skills */}
          <SectionCard title="Skills" accent="#a855f7">
            {(editing ? draft.skills : profile.skills).length === 0 && !editing && (
              <p style={{ margin: "0 0 0", color: "#9ca3af", fontStyle: "italic", fontSize: "14px" }}>
                No skills added yet. Click Edit Profile to add your skills.
              </p>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: editing ? "16px" : 0 }}>
              {(editing ? draft.skills : profile.skills).map((s, i) => (
                <SkillBadge key={s} skill={s} editable={editing}
                  onRemove={handleRemoveSkill} colorIndex={i} />
              ))}
            </div>
            {editing && (
              <form onSubmit={handleAddSkill} style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                <input value={newSkill} onChange={e => setNewSkill(e.target.value)}
                  placeholder="Type a skill and press Add"
                  style={{ ...inputStyle, flex: 1, maxWidth: "300px" }} />
                <button type="submit" style={btnPrimary}>Add</button>
              </form>
            )}
          </SectionCard>

          {/* Education */}
          <SectionCard title="Education" accent="#0891b2">
            <Field label="Degree & Institution" editing={editing}
              value={editing ? draft.education : profile.education}
              onChange={v => setDraft(d => ({ ...d, education: v }))}
              placeholder="e.g. MCA — KLS Gogte Institute of Technology" />
          </SectionCard>

          {/* Experience */}
          <SectionCard title="Experience" accent="#059669">
            <Field label="Work Experience" editing={editing} type="textarea"
              value={editing ? draft.experience : profile.experience}
              onChange={v => setDraft(d => ({ ...d, experience: v }))}
              placeholder="Describe your work experience or projects..." />
          </SectionCard>

          {/* Resume */}
          <SectionCard title="Resume" accent="#dc2626">
            <input ref={resumeInputRef} type="file" accept=".pdf"
              onChange={handleResumeChange} style={{ display: "none" }} />

            {resumeName ? (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 20px",
                background: "linear-gradient(135deg, #fef2f2, #fff5f5)",
                border: "2px solid #fecaca", borderRadius: "12px",
                flexWrap: "wrap", gap: "12px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "10px",
                    background: "linear-gradient(135deg, #dc2626, #ef4444)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(220,38,38,0.3)"
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1e1b4b" }}>{resumeName}</p>
                    <p style={{ margin: "3px 0 0", fontSize: "12px", fontWeight: 600, color: resumeUploading ? "#f59e0b" : "#059669" }}>
                      {resumeUploading ? "Uploading..." : "Uploaded successfully"}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => resumeInputRef.current.click()} style={btnSecondary}>Replace</button>
                  <button onClick={handleRemoveResume} style={{ ...btnSecondary, color: "#dc2626", borderColor: "#fecaca" }}>
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => resumeInputRef.current.click()}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "#7c3aed";
                  e.currentTarget.style.background = "linear-gradient(135deg, #f5f3ff, #ede9fe)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "#c4b5fd";
                  e.currentTarget.style.background = "linear-gradient(135deg, #fafafa, #f5f3ff)";
                }}
                style={{
                  border: "2px dashed #c4b5fd", borderRadius: "14px",
                  padding: "40px 24px", textAlign: "center", cursor: "pointer",
                  background: "linear-gradient(135deg, #fafafa, #f5f3ff)",
                  transition: "all 0.2s",
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: "14px",
                  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px",
                  boxShadow: "0 4px 16px rgba(79,70,229,0.35)"
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <p style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 700, color: "#1e1b4b" }}>
                  Upload your Resume
                </p>
                <p style={{ margin: 0, fontSize: "13px", color: "#9ca3af" }}>
                  PDF only &nbsp;&middot;&nbsp; Maximum 5MB
                </p>
              </div>
            )}

            {resumeUploaded && (
              <div style={{
                marginTop: "14px",
                background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
                border: "1px solid #6ee7b7", color: "#065f46",
                borderRadius: "10px", padding: "12px 16px",
                fontSize: "13px", fontWeight: 600,
              }}>
                Resume uploaded. The AI matching engine will use this to recommend relevant jobs.
              </div>
            )}
          </SectionCard>

        </div>
      </div>
    </div>
  );
}