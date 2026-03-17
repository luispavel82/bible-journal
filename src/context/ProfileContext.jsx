import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { defaultStartDate } from '../lib/dayUtils'

const ProfileContext = createContext({})

export const ProfileProvider = ({ children }) => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setLoadingProfile(false)
      return
    }
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data) {
        setProfile(data)
      } else {
        // Crear perfil por defecto
        const defaults = {
          user_id: user.id,
          display_name: user.email.split('@')[0],
          plan_start_date: defaultStartDate(),
        }
        const { data: created } = await supabase
          .from('profiles')
          .insert(defaults)
          .select()
          .single()
        setProfile(created || defaults)
      }
      setLoadingProfile(false)
    }
    fetchProfile()
  }, [user])

  const updateProfile = async (updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single()
    if (!error && data) setProfile(data)
    return { data, error }
  }

  // plan_start_date con fallback
  const planStartDate = profile?.plan_start_date || defaultStartDate()

  return (
    <ProfileContext.Provider value={{ profile, loadingProfile, updateProfile, planStartDate }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => useContext(ProfileContext)
