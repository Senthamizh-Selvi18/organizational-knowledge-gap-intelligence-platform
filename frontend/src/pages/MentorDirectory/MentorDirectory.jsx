import DashboardLayout from "../../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { FiX, FiStar, FiAward } from "react-icons/fi";
import {
  getAllMentors,
  getMyMentorProfile,
  upsertMyMentorProfile,
} from "../../services/mentorProfileService";
import { createMentorshipRequest } from "../../services/mentorshipRequestService";

const EMPTY_PROFILE_FORM = {
  expertiseAreas: "",
  bio: "",
  yearsOfExperience: "",
  availability: "",
  maxMentees: 3,
  active: true,
};

export default function MentorDirectory() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [myProfile, setMyProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(EMPTY_PROFILE_FORM);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const [requestTarget, setRequestTarget] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestError, setRequestError] = useState(null);
  const [requestSuccess, setRequestSuccess] = useState(null);

  const loadMentors = () => {
    setLoading(true);
    setError(null);

    getAllMentors(searchTerm)
      .then((data) => setMentors(data || []))
      .catch((err) => {
        console.error(err);
        setError("Unable to load the mentor directory. Please try again later.");
      })
      .finally(() => setLoading(false));
  };

  const loadMyProfile = () => {
    getMyMentorProfile()
      .then((data) => setMyProfile(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadMentors();
    loadMyProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timeout = setTimeout(loadMentors, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const openProfileModal = () => {
    setProfileForm(
      myProfile
        ? {
            expertiseAreas: myProfile.expertiseAreas || "",
            bio: myProfile.bio || "",
            yearsOfExperience: myProfile.yearsOfExperience ?? "",
            availability: myProfile.availability || "",
            maxMentees: myProfile.maxMentees ?? 3,
            active: myProfile.active ?? true,
          }
        : EMPTY_PROFILE_FORM
    );
    setProfileError(null);
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    if (savingProfile) return;
    setShowProfileModal(false);
  };

  const handleProfileChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();

    if (!profileForm.expertiseAreas.trim()) {
      setProfileError("Please list at least one area of expertise.");
      return;
    }
    if (!profileForm.maxMentees || Number(profileForm.maxMentees) < 1) {
      setProfileError("Max mentees must be at least 1.");
      return;
    }

    setSavingProfile(true);
    setProfileError(null);

    const payload = {
      expertiseAreas: profileForm.expertiseAreas.trim(),
      bio: profileForm.bio.trim(),
      yearsOfExperience: profileForm.yearsOfExperience
        ? Number(profileForm.yearsOfExperience)
        : null,
      availability: profileForm.availability.trim(),
      maxMentees: Number(profileForm.maxMentees),
      active: profileForm.active,
    };

    upsertMyMentorProfile(payload)
      .then((saved) => {
        setMyProfile(saved);
        setShowProfileModal(false);
        loadMentors();
      })
      .catch((err) => {
        console.error(err);
        const backendMessage = err.response?.data?.message;
        setProfileError(backendMessage || "Unable to save your mentor profile.");
      })
      .finally(() => setSavingProfile(false));
  };

  const openRequestModal = (mentor) => {
    setRequestTarget(mentor);
    setRequestMessage("");
    setRequestError(null);
    setRequestSuccess(null);
  };

  const closeRequestModal = () => {
    if (sendingRequest) return;
    setRequestTarget(null);
  };

  const handleSendRequest = (e) => {
    e.preventDefault();
    if (!requestTarget) return;

    setSendingRequest(true);
    setRequestError(null);

    createMentorshipRequest(requestTarget.id, requestMessage.trim())
      .then(() => {
        setRequestSuccess("Your mentorship request has been sent!");
        setTimeout(() => setRequestTarget(null), 1200);
      })
      .catch((err) => {
        console.error(err);
        const backendMessage = err.response?.data?.message;
        setRequestError(backendMessage || "Unable to send the request. Please try again.");
      })
      .finally(() => setSendingRequest(false));
  };

  const filteredMentors = mentors.filter((m) => {
    const term = searchTerm.trim().toLowerCase();
    if (term === "") return true;
    return (
      m.employeeName?.toLowerCase().includes(term) ||
      m.expertiseAreas?.toLowerCase().includes(term) ||
      m.department?.toLowerCase().includes(term) ||
      m.designation?.toLowerCase().includes(term)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-text">Expert Directory</h1>
            <p className="text-sub mt-2">
              Discover mentors across the organization and request mentorship in the areas you want to grow.
            </p>
          </div>

          <button
            onClick={openProfileModal}
            className="bg-primary text-white px-5 py-3 rounded-xl font-semibold hover:opacity-90 transition"
          >
            {myProfile ? "Edit My Mentor Profile" : "+ Become a Mentor"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl">{error}</div>
        )}

        <div className="bg-panel rounded-3xl shadow-xl p-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, expertise, or department..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {loading ? (
          <p className="text-mute">Loading mentors...</p>
        ) : filteredMentors.length === 0 ? (
          <div className="bg-panel rounded-3xl shadow-xl p-10 text-center text-mute">
            No mentors found. Be the first to add your profile!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-panel rounded-3xl shadow-xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-text">{mentor.employeeName}</h3>
                      <p className="text-sub text-sm">
                        {mentor.designation} · {mentor.department}
                      </p>
                    </div>

                    {mentor.averageRating ? (
                      <span className="flex items-center gap-1 text-amber-500 text-sm font-semibold whitespace-nowrap">
                        <FiStar /> {mentor.averageRating}
                        <span className="text-mute font-normal">({mentor.totalReviews})</span>
                      </span>
                    ) : (
                      <span className="text-mute text-xs whitespace-nowrap">No reviews yet</span>
                    )}
                  </div>

                  <p className="text-sub text-sm mt-3 line-clamp-3">
                    {mentor.bio || "No bio provided."}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {mentor.expertiseAreas
                      ?.split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((skill) => (
                        <span
                          key={skill}
                          className="text-xs font-semibold px-2 py-1 rounded-xl bg-primary-tint text-primary whitespace-nowrap"
                        >
                          {skill}
                        </span>
                      ))}
                  </div>

                  <div className="flex items-center gap-4 mt-4 text-sm text-sub">
                    {mentor.yearsOfExperience != null && (
                      <span className="flex items-center gap-1">
                        <FiAward /> {mentor.yearsOfExperience} yrs exp.
                      </span>
                    )}
                    <span>
                      {mentor.activeMenteeCount}/{mentor.maxMentees} mentees
                    </span>
                  </div>

                  {mentor.availability && (
                    <p className="text-mute text-xs mt-2">Availability: {mentor.availability}</p>
                  )}
                </div>

                <button
                  onClick={() => openRequestModal(mentor)}
                  disabled={mentor.activeMenteeCount >= mentor.maxMentees}
                  className="mt-5 bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mentor.activeMenteeCount >= mentor.maxMentees
                    ? "Fully Booked"
                    : "Request Mentorship"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Become / edit mentor profile modal */}
      {showProfileModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={closeProfileModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-text">
                {myProfile ? "Edit My Mentor Profile" : "Become a Mentor"}
              </h2>
              <button
                type="button"
                onClick={closeProfileModal}
                disabled={savingProfile}
                className="text-sub hover:text-text rounded-lg p-1.5 hover:bg-gray-100 transition"
                aria-label="Close"
              >
                <FiX size={20} />
              </button>
            </div>

            {profileError && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4">{profileError}</div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sub text-sm mb-1">Expertise Areas (comma-separated)</label>
                <input
                  type="text"
                  value={profileForm.expertiseAreas}
                  onChange={(e) => handleProfileChange("expertiseAreas", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. React, System Design, Career Growth"
                />
              </div>

              <div>
                <label className="block text-sub text-sm mb-1">Bio</label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => handleProfileChange("bio", e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="A short intro for prospective mentees"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sub text-sm mb-1">Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    value={profileForm.yearsOfExperience}
                    onChange={(e) => handleProfileChange("yearsOfExperience", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sub text-sm mb-1">Max Mentees</label>
                  <input
                    type="number"
                    min="1"
                    value={profileForm.maxMentees}
                    onChange={(e) => handleProfileChange("maxMentees", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sub text-sm mb-1">Availability</label>
                <input
                  type="text"
                  value={profileForm.availability}
                  onChange={(e) => handleProfileChange("availability", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Weekday evenings, 5-7 PM IST"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="mentorActive"
                  checked={profileForm.active}
                  onChange={(e) => handleProfileChange("active", e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="mentorActive" className="text-sub text-sm">
                  Actively accepting new mentees
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeProfileModal}
                  disabled={savingProfile}
                  className="px-5 py-2 rounded-xl font-semibold text-sub border border-gray-200 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-primary text-white px-5 py-2 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
                >
                  {savingProfile ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request mentorship modal */}
      {requestTarget && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={closeRequestModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 w-full max-w-md relative"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-text">
                Request Mentorship from {requestTarget.employeeName}
              </h2>
              <button
                type="button"
                onClick={closeRequestModal}
                disabled={sendingRequest}
                className="text-sub hover:text-text rounded-lg p-1.5 hover:bg-gray-100 transition"
                aria-label="Close"
              >
                <FiX size={20} />
              </button>
            </div>

            {requestError && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4">{requestError}</div>
            )}
            {requestSuccess && (
              <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl mb-4">{requestSuccess}</div>
            )}

            <form onSubmit={handleSendRequest} className="space-y-4">
              <div>
                <label className="block text-sub text-sm mb-1">Message (optional)</label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Tell them what you're hoping to learn or achieve..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeRequestModal}
                  disabled={sendingRequest}
                  className="px-5 py-2 rounded-xl font-semibold text-sub border border-gray-200 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingRequest}
                  className="bg-primary text-white px-5 py-2 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
                >
                  {sendingRequest ? "Sending..." : "Send Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}