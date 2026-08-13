import DashboardLayout from "../../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiUsers, FiCalendar, FiTrash2, FiX } from "react-icons/fi";
import {
  getGroup,
  getMembers,
  getPosts,
  createPost,
  deletePost,
  getEvents,
  createEvent,
  deleteEvent,
  joinGroup,
  leaveGroup,
  deleteGroup,
} from "../../services/communityGroupService";

const EMPTY_EVENT_FORM = { title: "", description: "", eventDateTime: "", location: "" };

export default function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const currentUserName = localStorage.getItem("name") || "";
  const role = localStorage.getItem("role")?.toLowerCase() || "";

  const [group, setGroup] = useState(null);
  const [tab, setTab] = useState("discussion");
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const [postContent, setPostContent] = useState("");
  const [postSaving, setPostSaving] = useState(false);

  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState(EMPTY_EVENT_FORM);
  const [eventSaving, setEventSaving] = useState(false);
  const [eventError, setEventError] = useState(null);

  const loadAll = () => {
    setLoading(true);
    setError(null);

    Promise.all([getGroup(groupId), getMembers(groupId), getPosts(groupId), getEvents(groupId)])
      .then(([g, m, p, e]) => {
        setGroup(g);
        setMembers(m || []);
        setPosts(p || []);
        setEvents(e || []);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load this group. It may not exist, or you may not have access.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const handleJoin = () => {
    setBusy(true);
    joinGroup(groupId)
      .then(() => loadAll())
      .catch((err) => setError(err.response?.data?.message || "Unable to join the group."))
      .finally(() => setBusy(false));
  };

  const handleLeave = () => {
    setBusy(true);
    leaveGroup(groupId)
      .then(() => navigate("/dashboard/community-groups"))
      .catch((err) => setError(err.response?.data?.message || "Unable to leave the group."))
      .finally(() => setBusy(false));
  };

  const handleDeleteGroup = () => {
    if (!window.confirm("Delete this group permanently? This cannot be undone.")) return;
    setBusy(true);
    deleteGroup(groupId)
      .then(() => navigate("/dashboard/community-groups"))
      .catch((err) => setError(err.response?.data?.message || "Unable to delete the group."))
      .finally(() => setBusy(false));
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    setPostSaving(true);
    createPost(groupId, postContent.trim())
      .then(() => {
        setPostContent("");
        loadAll();
      })
      .catch((err) => setError(err.response?.data?.message || "Unable to post."))
      .finally(() => setPostSaving(false));
  };

  const handleDeletePost = (postId) => {
    if (!window.confirm("Delete this post?")) return;
    deletePost(groupId, postId)
      .then(() => loadAll())
      .catch((err) => setError(err.response?.data?.message || "Unable to delete the post."));
  };

  const openEventModal = () => {
    setEventForm(EMPTY_EVENT_FORM);
    setEventError(null);
    setShowEventModal(true);
  };

  const closeEventModal = () => {
    if (eventSaving) return;
    setShowEventModal(false);
  };

  const handleEventChange = (field, value) => {
    setEventForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEventSubmit = (e) => {
    e.preventDefault();

    if (!eventForm.title.trim() || !eventForm.eventDateTime) {
      setEventError("Title and date/time are required.");
      return;
    }

    setEventSaving(true);
    setEventError(null);

    createEvent(groupId, {
      title: eventForm.title.trim(),
      description: eventForm.description.trim(),
      eventDateTime: new Date(eventForm.eventDateTime).toISOString(),
      location: eventForm.location.trim(),
    })
      .then(() => {
        setShowEventModal(false);
        loadAll();
      })
      .catch((err) => setEventError(err.response?.data?.message || "Unable to create the event."))
      .finally(() => setEventSaving(false));
  };

  const handleDeleteEvent = (eventId) => {
    if (!window.confirm("Delete this event?")) return;
    deleteEvent(groupId, eventId)
      .then(() => loadAll())
      .catch((err) => setError(err.response?.data?.message || "Unable to delete the event."));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-mute">Loading group...</p>
      </DashboardLayout>
    );
  }

  if (!group) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl">{error}</div>
      </DashboardLayout>
    );
  }

  const isGroupOwner = group.createdByName === currentUserName;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <button
          onClick={() => navigate("/dashboard/community-groups")}
          className="flex items-center gap-2 text-sub hover:text-text font-semibold text-sm"
        >
          <FiArrowLeft /> Back to Groups
        </button>

        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl">{error}</div>}

        <div className="bg-panel rounded-3xl shadow-xl p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <span className="text-xs font-semibold px-2 py-1 rounded-xl bg-primary-tint text-primary whitespace-nowrap">
                {group.category}
              </span>
              <h1 className="text-2xl font-bold text-text mt-2">{group.name}</h1>
              <p className="text-sub text-sm mt-2">{group.description}</p>
              <div className="flex items-center gap-2 mt-3 text-mute text-xs">
                <FiUsers /> {group.memberCount} members · created by {group.createdByName}
              </div>
            </div>

            <div className="flex gap-3">
              {group.isMember ? (
                !isGroupOwner && (
                  <button
                    onClick={handleLeave}
                    disabled={busy}
                    className="border border-gray-200 text-sub px-4 py-2 rounded-xl font-semibold hover:bg-gray-50 transition disabled:opacity-60"
                  >
                    Leave Group
                  </button>
                )
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={busy}
                  className="bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
                >
                  Join Group
                </button>
              )}

              {(isGroupOwner || role === "admin") && (
                <button
                  onClick={handleDeleteGroup}
                  disabled={busy}
                  className="text-red-600 hover:text-red-700 font-semibold text-sm px-3"
                >
                  Delete Group
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setTab("discussion")}
            className={`px-5 py-2 rounded-xl font-semibold transition ${
              tab === "discussion" ? "bg-primary text-white" : "bg-panel text-sub hover:text-text"
            }`}
          >
            Discussion
          </button>
          <button
            onClick={() => setTab("events")}
            className={`px-5 py-2 rounded-xl font-semibold transition ${
              tab === "events" ? "bg-primary text-white" : "bg-panel text-sub hover:text-text"
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setTab("members")}
            className={`px-5 py-2 rounded-xl font-semibold transition ${
              tab === "members" ? "bg-primary text-white" : "bg-panel text-sub hover:text-text"
            }`}
          >
            Members
          </button>
        </div>

        {/* Discussion tab */}
        {tab === "discussion" && (
          <div className="space-y-4">
            {group.isMember && (
              <div className="bg-panel rounded-3xl shadow-xl p-6">
                <form onSubmit={handlePostSubmit} className="space-y-3">
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Share something with the group..."
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={postSaving || !postContent.trim()}
                      className="bg-primary text-white px-5 py-2 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
                    >
                      {postSaving ? "Posting..." : "Post"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {posts.length === 0 ? (
              <div className="bg-panel rounded-3xl shadow-xl p-10 text-center text-mute">
                No posts yet. {group.isMember && "Start the conversation!"}
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-panel rounded-3xl shadow-xl p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-text text-sm">{post.authorName}</p>
                      <p className="text-mute text-xs mt-0.5">
                        {new Date(post.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {(post.authorName === currentUserName || isGroupOwner || role === "admin") && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-500 hover:text-red-600"
                        aria-label="Delete post"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>
                  <p className="text-sub text-sm mt-3 whitespace-pre-wrap">{post.content}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Events tab */}
        {tab === "events" && (
          <div className="space-y-4">
            {group.isMember && (
              <div className="flex justify-end">
                <button
                  onClick={openEventModal}
                  className="bg-primary text-white px-5 py-3 rounded-xl font-semibold hover:opacity-90 transition"
                >
                  + Schedule Event
                </button>
              </div>
            )}

            {events.length === 0 ? (
              <div className="bg-panel rounded-3xl shadow-xl p-10 text-center text-mute">
                No events scheduled yet.
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="bg-panel rounded-3xl shadow-xl p-6 flex items-start justify-between gap-4"
                >
                  <div>
                    <h3 className="font-bold text-text">{event.title}</h3>
                    <p className="flex items-center gap-2 text-sub text-sm mt-1">
                      <FiCalendar size={14} />
                      {new Date(event.eventDateTime).toLocaleString()}
                    </p>
                    {event.location && (
                      <p className="text-mute text-xs mt-1">📍 {event.location}</p>
                    )}
                    {event.description && (
                      <p className="text-sub text-sm mt-2">{event.description}</p>
                    )}
                    <p className="text-mute text-xs mt-2">Organized by {event.createdByName}</p>
                  </div>
                  {(event.createdByName === currentUserName || isGroupOwner || role === "admin") && (
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-red-500 hover:text-red-600"
                      aria-label="Delete event"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Members tab */}
        {tab === "members" && (
          <div className="bg-panel rounded-3xl shadow-xl p-6">
            {members.length === 0 ? (
              <p className="text-mute">No members yet.</p>
            ) : (
              <div className="space-y-3">
                {members.map((m) => (
                  <div
                    key={m.employeeId}
                    className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-b-0 last:pb-0"
                  >
                    <div>
                      <p className="font-semibold text-text text-sm">{m.employeeName}</p>
                      <p className="text-mute text-xs">
                        {m.designation} · {m.department}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-xl bg-primary-tint text-primary">
                      {m.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Schedule Event Modal */}
      {showEventModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={closeEventModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 w-full max-w-lg relative"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-text">Schedule an Event</h2>
              <button
                type="button"
                onClick={closeEventModal}
                disabled={eventSaving}
                className="text-sub hover:text-text rounded-lg p-1.5 hover:bg-gray-100 transition"
                aria-label="Close"
              >
                <FiX size={20} />
              </button>
            </div>

            {eventError && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4">{eventError}</div>
            )}

            <form onSubmit={handleEventSubmit} className="space-y-4">
              <div>
                <label className="block text-sub text-sm mb-1">Title</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => handleEventChange("title", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Monthly React meetup"
                />
              </div>

              <div>
                <label className="block text-sub text-sm mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={eventForm.eventDateTime}
                  onChange={(e) => handleEventChange("eventDateTime", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sub text-sm mb-1">Location / Meeting Link</label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={(e) => handleEventChange("location", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Conference Room B, or https://meet.google.com/..."
                />
              </div>

              <div>
                <label className="block text-sub text-sm mb-1">Description (optional)</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => handleEventChange("description", e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEventModal}
                  disabled={eventSaving}
                  className="px-5 py-2 rounded-xl font-semibold text-sub border border-gray-200 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={eventSaving}
                  className="bg-primary text-white px-5 py-2 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
                >
                  {eventSaving ? "Scheduling..." : "Schedule Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}