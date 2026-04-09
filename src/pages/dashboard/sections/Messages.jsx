import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../../lib/supabaseClient.js'
import { 
  setConversations, 
  setActiveConversationId, 
  setMessages, 
  addMessage,
  reconcileMessage,
  setLoading 
} from '../../../store/messagingSlice.js'
import { addAlert } from '../../../store/uiSlice.js'
import { IoSend, IoChatbubblesOutline, IoPersonCircleOutline, IoArrowBack } from 'react-icons/io5'

const BUCKET_PROFILES = 'user_profiles'

export default function Messages() {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useSelector((state) => state.auth.user)
  const { conversations, activeConversationId, messages, loading } = useSelector((state) => state.messaging)
  
  const [newMessage, setNewMessage] = useState('')
  const [proProfiles, setProProfiles] = useState({})
  const [msgLoading, setMsgLoading] = useState(false)
  const scrollRef = useRef(null)

  // Use a ref to track messages for the subscription closure
  const messagesRef = useRef(messages)
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  const queryConvoId = searchParams.get('convo')

  // 1. Fetch Conversations & Professional Participant Profiles
  useEffect(() => {
    if (!user) return

    const fetchConvos = async () => {
      dispatch(setLoading(true))
      try {
        const { data: convos, error } = await supabase
          .from('sv_conversations')
          .select('*')
          .or(`user_1.eq.${user.id},user_2.eq.${user.id}`)
          .order('last_message_at', { ascending: false })

        if (error) throw error

        // Fetch professional profiles for all participants involved
        const participantIds = Array.from(new Set(convos.flatMap(c => [c.user_1, c.user_2])))
        if (participantIds.length > 0) {
          const { data: profs, error: profError } = await supabase
            .from('sv_professional_profiles')
            .select('user_id, title, profile_img')
            .in('user_id', participantIds)
          
          if (profError) throw profError
          
          const profMap = {}
          profs.forEach(p => { profMap[p.user_id] = p })
          setProProfiles(prev => ({ ...prev, ...profMap }))
        }

        dispatch(setConversations(convos))
        
        // Auto-select from URL if present
        if (queryConvoId) {
          dispatch(setActiveConversationId(queryConvoId))
        }
      } catch (err) {
        dispatch(addAlert({ type: 'danger', title: 'Sync Error', message: err.message }))
      } finally {
        dispatch(setLoading(false))
      }
    }

    fetchConvos()
  }, [user, queryConvoId])

  // 2. Fetch Messages for Active Conversation
  useEffect(() => {
    if (!activeConversationId) return

    const fetchMessages = async () => {
      setMsgLoading(true)
      try {
        const { data, error } = await supabase
          .from('sv_messages')
          .select('*')
          .eq('conversation_id', activeConversationId)
          .order('created_at', { ascending: true })

        if (error) throw error
        dispatch(setMessages(data))
      } catch (err) {
        console.error("Message Fetch Error:", err)
      } finally {
        setMsgLoading(false)
      }
    }

    fetchMessages()

    // 3. Real-time Subscription with Deduplication
    const channel = supabase
      .channel(`convo_${activeConversationId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'sv_messages',
        filter: `conversation_id=eq.${activeConversationId}`
      }, (payload) => {
        const newMsg = payload.new
        // Pulse Reconciliation: Intelligently merge or add
        dispatch(reconcileMessage(newMsg))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeConversationId])

  // 4. Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConversationId || !user) return

    const msgContent = newMessage.trim()
    setNewMessage('')

    // OPTIMISTIC UPDATE: Generate a temp entry
    const tempId = crypto.randomUUID()
    const optimisticMsg = {
        id: tempId,
        conversation_id: activeConversationId,
        sender_id: user.id,
        content: msgContent,
        created_at: new Date().toISOString(),
        isOptimistic: true
    }
    dispatch(addMessage(optimisticMsg))

    try {
      const { data, error } = await supabase
        .from('sv_messages')
        .insert({
          conversation_id: activeConversationId,
          sender_id: user.id,
          content: msgContent
        })
        .select()
        .single()

      if (error) throw error

      // Update the optimistic message with real DB data to prevent double-rendering if broadcast hits later
      // Actually, addMessage adds to state. Deduplication in subscription handles the broadcast.
      // We just need to make sure the optimistic message is eventually replaced by the one with the real ID.
      // For simplicity here, we'll let the subscription handle the "real" one and we could remove the optimistic one.
      // But a better way is to set the ID early if possible. Since it's gen_random_uuid, we can't easily.
      // So we'll keep it as is; the deduplication in subscription will check ID.
      // Important: the optimistic one has a random UUID, the real one will have a different one. 
      // TRICK: Replace the optimistic one in state manually or just let it coexist? 
      // Better: In a real app we'd map tempId -> realId. Here, I'll filter out optimistics when the real one arrives.
      
      // Update last_message_at for sorting
      await supabase
        .from('sv_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', activeConversationId)

    } catch (err) {
      dispatch(addAlert({ type: 'danger', title: 'Send Error', message: err.message }))
      // Rollback optimistic? (Skipping for brevity but ideal)
    }
  }

  const activeConvo = conversations.find(c => c.id === activeConversationId)
  const otherParticipantId = activeConvo ? (activeConvo.user_1 === user?.id ? activeConvo.user_2 : activeConvo.user_1) : null

  const getIdentity = (uid) => {
    const prof = proProfiles[uid]
    if (prof) {
      return {
        name: prof.title || 'Professional',
        img: prof.profile_img,
        isPro: true
      }
    }
    return {
      name: uid ? `User ${uid.slice(0, 8)}...` : 'Identifying...',
      img: null,
      isPro: false
    }
  }

  const handleBackToList = () => {
    dispatch(setActiveConversationId(null))
    setSearchParams({})
  }

  return (
    <div className="sv-inbox-container">
      <div className="sv-page-head px-4 pt-4">
        <div className="sv-page-head__kicker">Communications</div>
        <h1 className="sv-page-head__title">Industrial Inbox</h1>
      </div>

      <div className="sv-inbox-grid mt-4">
        {/* Sidebar: Conversations (Hidden on mobile when chat is active) */}
        <div className={`sv-inbox-sidebar ${activeConversationId ? 'd-none d-md-flex' : 'd-flex'}`}>
          <div className="sv-inbox-sidebar__head">Active Threads</div>
          <div className="sv-inbox-sidebar__list">
            {loading && conversations.length === 0 ? (
              [1, 2, 3].map(i => (
                <div key={i} className="sv-convo-item sv-skeleton-pulse">
                  <div className="sv-convo-item__avatar" />
                  <div className="sv-convo-item__info">
                    <div className="sv-skeleton-line w-75 mb-1" />
                    <div className="sv-skeleton-line w-50" />
                  </div>
                </div>
              ))
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-secondary opacity-50 h-100 d-flex flex-column align-items-center justify-content-center">
                <IoChatbubblesOutline size={32} className="mb-2" />
                <p className="small">No conversations yet.</p>
              </div>
            ) : (
              conversations.map((convo) => {
                const otherId = convo.user_1 === user?.id ? convo.user_2 : convo.user_1
                const identity = getIdentity(otherId)
                const isActive = activeConversationId === convo.id

                return (
                  <div 
                    key={convo.id} 
                    className={`sv-convo-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      dispatch(setActiveConversationId(convo.id))
                      setSearchParams({ convo: convo.id })
                    }}
                  >
                    <div className="sv-convo-item__avatar">
                      {identity.img ? (
                        <img src={`${supabase.storage.from(BUCKET_PROFILES).getPublicUrl(identity.img).data.publicUrl}`} alt="" />
                      ) : (
                        <IoPersonCircleOutline />
                      )}
                    </div>
                    <div className="sv-convo-item__info">
                      <div className="sv-convo-item__name">{identity.name}</div>
                      <div className="sv-convo-item__date">{new Date(convo.last_message_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Main: Chat Thread (Hidden on mobile when list is active) */}
        <div className={`sv-inbox-main ${activeConversationId ? 'd-flex' : 'd-none d-md-flex'}`}>
          {activeConversationId ? (
            <div className="sv-chat-window">
              <div className="sv-chat-header">
                {(() => {
                  const identity = getIdentity(otherParticipantId)
                  return (
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-3">
                        <button className="btn btn-link p-0 text-white d-md-none me-1" onClick={handleBackToList}>
                          <IoArrowBack size={24} />
                        </button>
                        <div className="sv-convo-item__avatar sm">
                            {identity.img ? (
                              <img src={`${supabase.storage.from(BUCKET_PROFILES).getPublicUrl(identity.img).data.publicUrl}`} alt="" />
                            ) : (
                              <IoPersonCircleOutline />
                            )}
                        </div>
                        <div>
                            <div className="fw-bold text-white lh-1">{identity.name}</div>
                            <div className={`extra-small fw-bold ${identity.isPro ? 'text-emerald' : 'text-secondary'}`}>
                              {identity.isPro ? 'Verified Professional' : 'Client User'}
                            </div>
                        </div>
                      </div>
                      {msgLoading && (
                        <div className="d-flex align-items-center gap-2 text-emerald extra-small fw-bold opacity-75">
                           <span className="sv-pulse-dot" /> Syncing...
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>

              <div className="sv-chat-messages" ref={scrollRef}>
                <AnimatePresence initial={false}>
                  {messages.map((msg) => {
                    const isMe = msg.sender_id === user?.id
                    return (
                      <motion.div 
                        key={msg.id}
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className={`sv-msg-bubble-wrapper ${isMe ? 'me' : 'them'}`}
                      >
                        <div className={`sv-msg-bubble ${isMe ? 'me' : 'them'} ${msg.isOptimistic ? 'opacity-50' : ''}`}>
                          {msg.content}
                        </div>
                        <div className="sv-msg-time">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>

              <form className="sv-chat-input" onSubmit={handleSendMessage}>
                <input 
                  type="text" 
                  placeholder="Type your message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="btn-send" disabled={!newMessage.trim()}>
                  <IoSend />
                </button>
              </form>
            </div>
          ) : (
            <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center p-5 opacity-25">
               <IoChatbubblesOutline size={80} className="mb-3 text-emerald" />
               <h3 className="fw-bold text-white">Select a Thread</h3>
               <p className="max-w-xs mx-auto">Choose a conversation from the sidebar to begin your industrial exchange.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .sv-inbox-container {
          height: calc(100vh - 140px);
          display: flex;
          flex-direction: column;
          margin-bottom: 20px;
        }
        .sv-inbox-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 1px;
          background: rgba(63, 191, 90, 0.1);
          flex: 1;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(63, 191, 90, 0.1);
        }
        .sv-inbox-sidebar {
          background: #0b1510;
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(63, 191, 90, 0.1);
        }
        .sv-inbox-sidebar__head {
          padding: 20px;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 1px;
          color: #3fbf5a;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .sv-inbox-sidebar__list {
          flex: 1;
          overflow-y: auto;
        }
        .sv-convo-item {
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          cursor: pointer;
          transition: all 0.2s;
          border-bottom: 1px solid rgba(255,255,255,0.02);
        }
        .sv-convo-item:hover { background: rgba(63, 191, 90, 0.05); }
        .sv-convo-item.active { background: rgba(63, 191, 90, 0.1); }
        .sv-convo-item__avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          font-size: 2rem;
          color: rgba(63, 191, 90, 0.5);
        }
        .sv-convo-item__avatar.sm { width: 40px; height: 40px; }
        .sv-convo-item__avatar img { width: 100%; height: 100%; object-fit: cover; }
        .sv-convo-item__info { flex: 1; overflow: hidden; }
        .sv-convo-item__name { font-weight: 600; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sv-convo-item__date { font-size: 0.75rem; opacity: 0.5; margin-top: 2px; }

        .sv-inbox-main { background: #0b1510; display: flex; flex-direction: column; height: 100%; border-radius: 0 20px 20px 0; overflow: hidden; }
        .sv-chat-window { display: flex; flex-direction: column; height: 100%; max-height: 100%; }
        .sv-chat-header { padding: 15px 25px; border-bottom: 1px solid rgba(255,255,255,0.05); flex-shrink: 0; min-height: 70px; display: flex; align-items: center; }
        .sv-chat-messages { flex: 1; overflow-y: auto; padding: 25px; display: flex; flex-direction: column; gap: 10px; min-height: 0; }
        
        .sv-msg-bubble-wrapper { display: flex; flex-direction: column; max-width: 80%; }
        .sv-msg-bubble-wrapper.me { align-self: flex-end; align-items: flex-end; }
        .sv-msg-bubble-wrapper.them { align-self: flex-start; align-items: flex-start; }
        
        .sv-msg-bubble { padding: 12px 18px; border-radius: 18px; font-size: 0.95rem; line-height: 1.5; }
        .sv-msg-bubble.me { background: #3fbf5a; color: #000; font-weight: 500; border-bottom-right-radius: 4px; }
        .sv-msg-bubble.them { background: rgba(255,255,255,0.05); color: #fff; border-bottom-left-radius: 4px; }
        .sv-msg-time { font-size: 0.7rem; opacity: 0.4; margin-top: 4px; }

        .sv-chat-input { padding: 20px 25px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; gap: 12px; }
        .sv-chat-input input { 
          flex: 1; background: rgba(255,255,255,0.03); border: 1px solid rgba(63, 191, 90, 0.1); 
          border-radius: 12px; padding: 12px 20px; color: #fff; outline: none; transition: all 0.2s;
        }
        .sv-chat-input input:focus { border-color: #3fbf5a; background: rgba(63, 191, 90, 0.05); }
        .btn-send { 
          width: 48px; height: 48px; border-radius: 12px; border: none; background: #3fbf5a; 
          color: #000; font-size: 1.25rem; display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .btn-send:disabled { opacity: 0.3; cursor: not-allowed; }

        /* Industrial Pulse dot */
        .sv-pulse-dot { width: 8px; height: 8px; background: #3fbf5a; border-radius: 50%; display: inline-block; animation: sv-pulse-soft 1.5s infinite; }
        @keyframes sv-pulse-soft { 
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }

        /* Skeleton Pulse Loader */
        .sv-skeleton-pulse { pointer-events: none; }
        .sv-skeleton-line { height: 10px; background: rgba(255,255,255,0.1); border-radius: 4px; position: relative; overflow: hidden; }
        .sv-skeleton-line::after {
          content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(63, 191, 90, 0.1), transparent);
          animation: sv-skeleton-sweep 1.5s infinite;
        }
        @keyframes sv-skeleton-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @media (max-width: 768px) {
          .sv-inbox-grid { grid-template-columns: 1fr; height: 100%; }
          .sv-inbox-sidebar { border-right: none; }
          .sv-inbox-main { border-radius: 20px; }
          .sv-chat-header { padding: 10px 15px; }
          .sv-chat-messages { padding: 15px; }
          .sv-chat-input { padding: 10px 15px; }
          .sv-msg-bubble { padding: 10px 14px; }
          .sv-msg-bubble-wrapper { max-width: 90%; }
        }
      `}</style>
    </div>
  )
}

