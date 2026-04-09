import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { setActiveConversationId, setLoading, setError } from '../store/messagingSlice.js'
import { showLoader, hideLoader, addAlert, setLoaderMessage } from '../store/uiSlice.js'

export const useMessaging = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector((state) => state.auth.user)
  const [initLoading, setInitLoading] = useState(false)

  const initiateConversation = async (targetUserId) => {
    if (!currentUser) {
      navigate('/login')
      return null
    }

    if (currentUser.id === targetUserId) {
      dispatch(addAlert({
        type: 'warning',
        title: 'Industrial Conflict',
        message: 'Direct peer exchange with self is not supported.'
      }))
      return null
    }

    setInitLoading(true)
    dispatch(setLoading(true))
    dispatch(showLoader('Initializing industrial handshake...'))

    try {
      // 0. Verify the target is a professional
      const { data: targetPro, error: targetError } = await supabase
        .from('sv_professional_profiles')
        .select('id')
        .eq('user_id', targetUserId)
        .maybeSingle()

      if (targetError) throw targetError
      if (!targetPro) {
        dispatch(addAlert({
          type: 'danger',
          title: 'Direct Peer Error',
          message: 'Industrial channels can only be opened with registered marketplace professionals.'
        }))
        return null
      }

      // 1. Check for existing conversation (bidirectional)
      const { data: existing, error: findError } = await supabase
        .from('sv_conversations')
        .select('id')
        .or(`and(user_1.eq.${currentUser.id},user_2.eq.${targetUserId}),and(user_1.eq.${targetUserId},user_2.eq.${currentUser.id})`)
        .maybeSingle()

      if (findError) throw findError

      if (existing) {
        dispatch(setActiveConversationId(existing.id))
        dispatch(addAlert({
          type: 'info',
          title: 'Resuming Session',
          message: 'Redirecting to established communication thread.',
          timeoutMs: 2000
        }))
        navigate(`/dashboard/messages?convo=${existing.id}`)
        return existing.id
      }

      // 2. Create new conversation if none exists
      dispatch(setLoaderMessage('Deploying Secure Thread...'))
      const { data: newConvo, error: createError } = await supabase
        .from('sv_conversations')
        .insert({
          user_1: currentUser.id,
          user_2: targetUserId,
          last_message_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) throw createError

      dispatch(setActiveConversationId(newConvo.id))
      dispatch(addAlert({
         type: 'success',
         title: 'Thread Established',
         message: 'Secure P2P channel created successfully.',
         timeoutMs: 3000
      }))
      navigate(`/dashboard/messages?convo=${newConvo.id}`)
      return newConvo.id

    } catch (err) {
      console.error("Messaging Error:", err)
      dispatch(setError(err.message))
      dispatch(addAlert({
        type: 'danger',
        title: 'Encryption Error',
        message: `Handshake failed: ${err.message}`
      }))
      return null
    } finally {
      setInitLoading(false)
      dispatch(setLoading(false))
      dispatch(hideLoader())
    }
  }

  return {
    initiateConversation,
    initLoading
  }
}
