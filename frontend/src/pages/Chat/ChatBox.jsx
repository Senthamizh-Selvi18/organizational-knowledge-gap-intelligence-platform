import { useState, useEffect, useRef, useCallback } from "react";
import { FiSearch, FiSend, FiMessageCircle, FiArrowLeft, FiUsers, FiMail, FiX } from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  getMe,
  getContacts,
  getSummaries,
  getConversation,
  sendMessage as apiSendMessage,
  markAsRead,
} from "../../services/chatservice";

function initials(name = "") {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function formatClock(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatListTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { day: "2-digit", month: "short" });
}

export default function ChatBox() {
  const [me, setMe] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [previewContact, setPreviewContact] = useState(null); // profile card before messaging
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [showContacts, setShowContacts] = useState(false);
  const [contactSearch, setContactSearch] = useState("");
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const scrollRef = useRef(null);

  const loadSummaries = useCallback(async () => {
    try {
      const data = await getSummaries();
      setSummaries(data);
    } catch (e) {
      console.error("Failed to load chat summaries", e);
    }
  }, []);

  const loadConversation = useCallback(async (otherUserId, { silent } = {}) => {
    try {
      const data = await getConversation(otherUserId);
      setMessages(data);
    } catch (e) {
      if (!silent) console.error("Failed to load conversation", e);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [meData, contactsData, summariesData] = await Promise.all([
          getMe(),
          getContacts(),
          getSummaries(),
        ]);
        setMe(meData);
        setContacts(contactsData);
        setSummaries(summariesData);
        setLoadError("");
      } catch (e) {
        console.error("Failed to initialize chat", e);
        setLoadError(
          e?.response?.status === 401 || e?.response?.status === 403
            ? "You're not authenticated for chat. Try logging out and back in."
            : "Couldn't load contacts. Check your connection and try again."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const id = setInterval(loadSummaries, 6000);
    return () => clearInterval(id);
  }, [loadSummaries]);

  useEffect(() => {
    if (!selected) return;
    const id = setInterval(() => {
      loadConversation(selected.id, { silent: true });
    }, 4000);
    return () => clearInterval(id);
  }, [selected, loadConversation]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const openConversation = async (contact) => {
    setPreviewContact(null);
    setSelected(contact);
    setMobileShowThread(true);
    setShowContacts(false);
    setMessages([]);
    await loadConversation(contact.id);
    try {
      await markAsRead(contact.id);
      loadSummaries();
    } catch (e) {
      console.error("Failed to mark conversation as read", e);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !selected) return;
    setDraft("");
    try {
      await apiSendMessage(selected.id, text);
      await loadConversation(selected.id, { silent: true });
      loadSummaries();
    } catch (e) {
      console.error("Failed to send message", e);
    }
  };

  const isMine = (msg) => me && msg.senderId === me.id;

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.role?.toLowerCase().includes(contactSearch.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">Messages</h1>
        <p className="text-sm text-sub">Chat directly with employees, managers, or leadership</p>
      </div>

      <div className="flex h-[calc(100vh-220px)] min-h-[480px] overflow-hidden rounded-2xl border border-line bg-panel shadow-card">
        {/* ===== LEFT: contact / conversation list ===== */}
        <div
          className={`w-full flex-col border-line md:flex md:w-80 md:border-r ${
            mobileShowThread ? "hidden" : "flex"
          }`}
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="font-serif text-lg font-semibold text-text">Chats</h2>
            <button
              type="button"
              onClick={() => {
                setShowContacts((s) => !s);
                setPreviewContact(null);
              }}
              className="kg-iconbtn flex items-center gap-1.5 rounded-lg bg-primary-tint px-3 py-1.5 text-xs font-semibold text-primary hover:opacity-90"
            >
              <FiUsers className="h-3.5 w-3.5" />
              {showContacts ? "Recent" : "New Chat"}
            </button>
          </div>

          {showContacts && (
            <div className="border-b border-line p-3">
              <label className="kg-search flex items-center gap-2 rounded-lg border border-line bg-bg px-3 py-2">
                <FiSearch className="h-3.5 w-3.5 text-mute" />
                <input
                  type="search"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  placeholder="Search people…"
                  className="w-full bg-transparent text-sm text-text outline-none placeholder:text-mute"
                />
              </label>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-sm text-sub">Loading…</div>
            ) : loadError ? (
              <div className="p-6 text-center text-sm text-rust">{loadError}</div>
            ) : showContacts ? (
              filteredContacts.length === 0 ? (
                <div className="p-6 text-center text-sm text-sub">
                  No people found.
                  <br />
                  Ask an admin to add teammates, or refresh.
                </div>
              ) : (
                filteredContacts.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setPreviewContact(c)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-primary-tint ${
                      selected?.id === c.id ? "bg-primary-tint" : ""
                    }`}
                  >
                    <div className="kg-av flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                      {initials(c.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-text">{c.name}</p>
                      <p className="truncate text-xs capitalize text-sub">{c.role}</p>
                    </div>
                  </button>
                ))
              )
            ) : summaries.length === 0 ? (
              <div className="p-6 text-center text-sm text-sub">
                No conversations yet.
                <br />
                Tap <b>New Chat</b> to message someone.
              </div>
            ) : (
              summaries.map((s) => (
                <button
                  key={s.contactId}
                  type="button"
                  onClick={() => openConversation({ id: s.contactId, name: s.contactName, role: s.contactRole })}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-primary-tint ${
                    selected?.id === s.contactId ? "bg-primary-tint" : ""
                  }`}
                >
                  <div className="relative">
                    <div className="kg-av flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                      {initials(s.contactName)}
                    </div>
                    {s.unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rust px-1 text-[10px] font-bold text-white">
                        {s.unreadCount > 9 ? "9+" : s.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-text">{s.contactName}</p>
                      <span className="shrink-0 text-[11px] text-mute">{formatListTime(s.lastMessageAt)}</span>
                    </div>
                    <p
                      className={`truncate text-xs ${
                        s.unreadCount > 0 ? "font-semibold text-text" : "text-sub"
                      }`}
                    >
                      {s.lastMessage}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ===== RIGHT: profile preview OR conversation thread ===== */}
        <div className={`flex-1 flex-col ${mobileShowThread || previewContact ? "flex" : "hidden md:flex"}`}>
          {previewContact ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
              <button
                type="button"
                onClick={() => setPreviewContact(null)}
                className="kg-iconbtn absolute left-4 top-4 md:hidden"
                aria-label="Back"
              >
                <FiArrowLeft className="h-4 w-4" />
              </button>
              <div className="kg-av flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-white">
                {initials(previewContact.name)}
              </div>
              <div>
                <p className="text-lg font-semibold text-text">{previewContact.name}</p>
                <p className="text-sm capitalize text-sub">{previewContact.role}</p>
                {previewContact.email && (
                  <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-mute">
                    <FiMail className="h-3.5 w-3.5" />
                    {previewContact.email}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openConversation(previewContact)}
                  className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                >
                  <FiMessageCircle className="h-4 w-4" />
                  Message
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewContact(null)}
                  className="flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-sub hover:bg-bg"
                >
                  <FiX className="h-4 w-4" />
                  Close
                </button>
              </div>
            </div>
          ) : selected ? (
            <>
              <div className="flex items-center gap-3 border-b border-line px-4 py-3">
                <button
                  type="button"
                  onClick={() => setMobileShowThread(false)}
                  className="kg-iconbtn md:hidden"
                  aria-label="Back to chats"
                >
                  <FiArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewContact(selected)}
                  className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-primary-tint"
                >
                  <div className="kg-av flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                    {initials(selected.name)}
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="truncate text-sm font-semibold text-text">{selected.name}</p>
                    <p className="truncate text-xs capitalize text-sub">{selected.role}</p>
                  </div>
                </button>
              </div>

              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-bg/40 px-4 py-4">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-sub">
                    No messages yet. Say hello 👋
                  </div>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className={`flex ${isMine(m) ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                          isMine(m)
                            ? "rounded-br-sm bg-primary text-white"
                            : "rounded-bl-sm border border-line bg-panel text-text"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.message}</p>
                        <p className={`mt-1 text-right text-[10px] ${isMine(m) ? "text-white/70" : "text-mute"}`}>
                          {formatClock(m.sentAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-line p-3">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message…"
                  className="flex-1 rounded-full border border-line bg-bg px-4 py-2.5 text-sm text-text outline-none placeholder:text-mute"
                />
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40"
                  aria-label="Send message"
                >
                  <FiSend className="h-4 w-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-sub">
              <FiMessageCircle className="h-10 w-10 text-mute" />
              <p className="text-sm">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}