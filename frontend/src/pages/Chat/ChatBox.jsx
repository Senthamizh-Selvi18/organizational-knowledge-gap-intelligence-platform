import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSend, FiMessageCircle, FiSearch } from "react-icons/fi";
import {
  getContacts,
  getConversation,
  sendMessage,
  markAsRead,
} from "../../services/chatService";

export default function ChatBox() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const [searchParams] = useSearchParams();

  // Lock browser scrolling while this page is open, so nothing can
  // ever push content below the visible window.
  useEffect(() => {
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
    };
  }, []);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoadingContacts(true);
      const data = await getContacts();
      setContacts(data);
    } catch (err) {
      setError("Could not load contacts.");
    } finally {
      setLoadingContacts(false);
    }
  };

  useEffect(() => {
    const withId = searchParams.get("with");
    if (withId && contacts.length > 0) {
      const match = contacts.find((c) => String(c.id) === withId);
      if (match) setSelectedContact(match);
    }
  }, [searchParams, contacts]);

  const loadConversation = useCallback(async (contactId) => {
    try {
      const data = await getConversation(contactId);
      setMessages(data);
      markAsRead(contactId).catch(() => {});
    } catch (err) {
      setError("Could not load messages.");
    }
  }, []);

  useEffect(() => {
    if (!selectedContact) return;

    loadConversation(selectedContact.id);

    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      loadConversation(selectedContact.id);
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selectedContact, loadConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    try {
      await sendMessage(selectedContact.id, newMessage.trim());
      setNewMessage("");
      loadConversation(selectedContact.id);
    } catch (err) {
      setError("Message could not be sent.");
    }
  };

  const filteredContacts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return contacts;
    return contacts.filter(
      (c) =>
        c.name?.toLowerCase().includes(term) ||
        c.role?.toLowerCase().includes(term)
    );
  }, [contacts, searchTerm]);

  const chatUI = (
    // Fixed directly against the real browser window, rendered via a
    // portal to <body> so no parent's transform/padding/overflow can
    // ever affect its position. top-16 = below navbar (h-16),
    // lg:left-64 = right of sidebar (w-64), matching your existing
    // DashboardLayout constants exactly.
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden">
     <div className="flex h-full w-full overflow-hidden bg-panel">
        {/* Contacts panel */}
        <div className="flex w-72 flex-none flex-col border-r border-line">
          <div className="flex-none border-b border-line px-4 py-3">
            <h2 className="font-serif text-lg font-bold text-text">TEST CHAT</h2>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-wide text-mute">
              People you can message
            </p>

            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mute" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search people..."
                className="w-full rounded-lg border border-line bg-transparent py-1.5 pl-8 pr-3 text-sm text-text placeholder-mute outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Independently scrollable contact list */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {loadingContacts ? (
              <p className="p-4 text-sm text-sub">Loading contacts...</p>
            ) : filteredContacts.length === 0 ? (
              <p className="p-4 text-sm text-sub">
                {contacts.length === 0
                  ? "No contacts available."
                  : "No matches found."}
              </p>
            ) : (
              <ul>
                {filteredContacts.map((contact) => (
                  <li key={contact.id}>
                    <button
                      onClick={() => setSelectedContact(contact)}
                      className={`flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left transition-colors hover:bg-primary-tint ${
                        selectedContact?.id === contact.id
                          ? "bg-primary-tint"
                          : ""
                      }`}
                    >
                      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-gradient-to-br from-grad1 to-grad2 font-semibold text-white">
                        {contact.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-text">
                          {contact.name}
                        </p>
                        <p className="truncate font-mono text-[10px] uppercase tracking-wide text-mute">
                          {contact.role}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Chat window */}
        <div className="flex h-full flex-1 flex-col">
          {!selectedContact ? (
            <div className="flex flex-1 flex-col items-center justify-center text-mute">
              <FiMessageCircle className="mb-2 h-10 w-10" />
              <p className="text-sm">Select someone to start chatting</p>
            </div>
          ) : (
            <>
              <div className="flex-none border-b border-line px-4 py-3">
                <p className="text-sm font-semibold text-text">
                  {selectedContact.name}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wide text-mute">
                  {selectedContact.role}
                </p>
              </div>

              {/* Independently scrollable messages area */}
              <div className="flex-1 overflow-y-auto p-4">
                {messages.map((msg) => {
                  const isMine = msg.senderId !== selectedContact.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${
                          isMine
                            ? "bg-primary text-white"
                            : "bg-primary-tint text-text"
                        }`}
                      >
                        <p>{msg.message}</p>
                        <p
                          className={`mt-1 text-[10px] ${
                            isMine ? "text-white/70" : "text-mute"
                          }`}
                        >
                          {new Date(msg.sentAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Always-visible, fixed input bar */}
              <form
                onSubmit={handleSend}
                className="flex items-center gap-2 border-t border-line p-3"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg border border-line bg-transparent px-3 py-2 text-sm text-text outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-primary text-white hover:opacity-90"
                >
                  <FiSend className="h-4 w-4" />
                </button>
              </form>
            </>
          )}

          {error && (
            <p className="flex-none border-t border-line px-4 py-2 text-xs text-rust">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return chatUI;
}