import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Session from '../components/Session'
import Campaigns from '../components/Campaigns'
import Memory from '../components/Memory'

const s = {
  app: { maxWidth: 720, margin: '0 auto', padding: '20px 16px' },
  topbar: { display: 'flex', alignItems: 'center', gap: 12, background: '#1a1830', border: '1px solid #2d2a4a', borderRadius: 12, padding: '10px 16px', marginBottom: 14 },
  logo: { width: 34, height: 34, borderRadius: '50%', background: '#3C3489', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 },
  title: { fontSize: 16, fontWeight: 600, color: '#fffffe' },
  sub: { fontSize: 12, color: '#a49fc8' },
  gmName: { marginLeft: 'auto', fontSize: 13, color: '#a49fc8', display: 'flex', alignItems: 'center', gap: 8 },
  signout: { fontSize: 12, padding: '4px 10px', background: 'transparent', border: '1px solid #2d2a4a', borderRadius: 6, color: '#a49fc8', cursor: 'pointer' },
  tabs: { display: 'flex', gap: 6, marginBottom: 14 },
  tab: { fontSize: 13, padding: '7px 16px', borderRadius: 8, border: '1px solid #2d2a4a', background: '#1a1830', color: '#a49fc8', cursor: 'pointer' },
  tabOn: { fontSize: 13, padding: '7px 16px', borderRadius: 8, border: '1px solid #3C3489', background: '#3C3489', color: '#EEEDFE', cursor: 'pointer' },
}

export default function Dashboard({ session }) {
  const [tab, setTab] = useState('session')
  const [campaigns, setCampaigns] = useState([])
  const [activeCampaign, setActiveCampaign] = useState(null)
  const [memory, setMemory] = useState([])

  const gmName = session.user.user_metadata?.display_name || session.user.email.split('@')[0]

  useEffect(() => { loadCampaigns() }, [])
  useEffect(() => { if (activeCampaign) loadMemory(activeCampaign.id) }, [activeCampaign])

  async function loadCampaigns() {
    const { data } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    if (data) setCampaigns(data)
  }

  async function loadMemory(campaignId) {
    const { data } = await supabase
      .from('memories')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: true })
    if (data) setMemory(data)
  }

  async function createCampaign(name, system, lore) {
    const { data, error } = await supabase
      .from('campaigns')
      .insert({ user_id: session.user.id, name, system, lore })
      .select()
      .single()
    if (!error && data) {
      setCampaigns(prev => [data, ...prev])
      setActiveCampaign(data)
      setTab('session')
    }
  }

  async function addMemory(tag, text) {
    if (!activeCampaign) return
    const { data, error } = await supabase
      .from('memories')
      .insert({ campaign_id: activeCampaign.id, user_id: session.user.id, tag, text })
      .select()
      .single()
    if (!error && data) setMemory(prev => [...prev, data])
  }

  async function deleteMemory(id) {
    await supabase.from('memories').delete().eq('id', id)
    setMemory(prev => prev.filter(m => m.id !== id))
  }

  function selectCampaign(camp) {
    setActiveCampaign(camp)
    setTab('session')
  }

  return (
    <div style={s.app}>
      <div style={s.topbar}>
        <div style={s.logo}>🎲</div>
        <div>
          <div style={s.title}>Co-Game GM</div>
          <div style={s.sub}>Your co-GM at every table</div>
        </div>
        <div style={s.gmName}>
          <span>👤 {gmName}</span>
          <button style={s.signout} onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
      </div>

      <div style={s.tabs}>
        {['session', 'campaigns', 'memory'].map(t => (
          <button key={t} style={tab === t ? s.tabOn : s.tab}
            onClick={() => setTab(t)}>
            {t === 'session' ? '▶ Session' : t === 'campaigns' ? '📖 Campaigns' : '🧠 Memory'}
          </button>
        ))}
      </div>

      {tab === 'session' && (
        <Session
          campaign={activeCampaign}
          memory={memory}
          onAddMemory={addMemory}
          onGoToCampaigns={() => setTab('campaigns')}
        />
      )}
      {tab === 'campaigns' && (
        <Campaigns
          campaigns={campaigns}
          activeCampaign={activeCampaign}
          onSelect={selectCampaign}
          onCreate={createCampaign}
        />
      )}
      {tab === 'memory' && (
        <Memory
          campaign={activeCampaign}
          memory={memory}
          onDelete={deleteMemory}
        />
      )}
    </div>
  )
}
