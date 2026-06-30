import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Session from '../components/Session'
import Campaigns from '../components/Campaigns'
import Memory from '../components/Memory'
import OneShotWizard from '../components/OneShotWizard'

const s = {
  app: { maxWidth: 720, margin: '0 auto', padding: '16px 14px' },
  topbar: { display: 'flex', alignItems: 'center', gap: 10, background: '#1a1830', border: '1px solid #2d2a4a', borderRadius: 12, padding: '10px 14px', marginBottom: 12 },
  logo: { width: 32, height: 32, borderRadius: '50%', background: '#3C3489', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 15 },
  title: { fontSize: 15, fontWeight: 600, color: '#fffffe' },
  sub: { fontSize: 11, color: '#a49fc8' },
  right: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 },
  osbtn: { fontSize: 12, padding: '5px 12px', background: '#1e1a40', border: '1px solid #534AB7', borderRadius: 7, color: '#b4aef5', cursor: 'pointer', fontWeight: 500 },
  gm: { fontSize: 12, color: '#a49fc8' },
  signout: { fontSize: 11, padding: '3px 8px', background: 'transparent', border: '1px solid #2d2a4a', borderRadius: 5, color: '#6b6890', cursor: 'pointer' },
  tabs: { display: 'flex', gap: 6, marginBottom: 12 },
  tab: { fontSize: 13, padding: '6px 14px', borderRadius: 8, border: '1px solid #2d2a4a', background: '#1a1830', color: '#a49fc8', cursor: 'pointer' },
  tabOn: { fontSize: 13, padding: '6px 14px', borderRadius: 8, border: '1px solid #3C3489', background: '#3C3489', color: '#EEEDFE', cursor: 'pointer' },
}

export default function Dashboard({ session }) {
  const [tab, setTab] = useState('session')
  const [campaigns, setCampaigns] = useState([])
  const [activeCampaign, setActiveCampaign] = useState(null)
  const [memory, setMemory] = useState([])
  const [buttons, setButtons] = useState([])
  const [showOneShot, setShowOneShot] = useState(false)

  const gmName = session.user.user_metadata?.display_name || session.user.email.split('@')[0]

  useEffect(() => { loadCampaigns() }, [])

  useEffect(() => {
    if (activeCampaign) {
      loadMemory(activeCampaign.id)
      loadButtons(activeCampaign.id)
    }
  }, [activeCampaign?.id])

  async function loadCampaigns() {
    const { data } = await supabase.from('campaigns').select('*')
      .eq('user_id', session.user.id).order('created_at', { ascending: false })
    if (data) setCampaigns(data)
  }

  async function loadMemory(cid) {
    const { data } = await supabase.from('memories').select('*')
      .eq('campaign_id', cid).order('created_at', { ascending: true })
    if (data) setMemory(data)
  }

  async function loadButtons(cid) {
    const { data } = await supabase.from('campaign_buttons').select('*')
      .eq('campaign_id', cid).order('position', { ascending: true })
    if (data && data.length) setButtons(data)
    else setButtons([])
  }

  // ── Create campaign ────────────────────────────────────────────────────────
  async function createCampaign(name, system, lore, rulesReference, bgImageUrl) {
    const { data, error } = await supabase.from('campaigns').insert({
      user_id: session.user.id,
      name,
      system,
      lore: lore || '',
      rules_reference: rulesReference || '',
      bg_image_url: bgImageUrl || '',
    }).select().single()
    if (error) throw new Error(error.message)
    return data
  }

  // ── Save one shot memory — called AFTER campaign is created with real ID ──
  async function saveOneShotMemory(campaignId, sceneData) {
    const entries = []

    // 1. Scene overview plot entry
    const overviewParts = [
      '🎲 One Shot: ' + sceneData.name,
      sceneData.scene_tone ? 'Tone: ' + sceneData.scene_tone : null,
      sceneData.scene_hook ? 'Hook: ' + sceneData.scene_hook : null,
      sceneData.scene_complication ? 'Twist: ' + sceneData.scene_complication : null,
      sceneData.scene_goal ? 'Goal: ' + sceneData.scene_goal : null,
    ].filter(Boolean)

    entries.push({
      campaign_id: campaignId,
      user_id: session.user.id,
      tag: 'plot',
      text: overviewParts.join(' | ').slice(0, 400)
    })

    // 2. Each NPC
    if (sceneData.scene_npcs && sceneData.scene_npcs.length > 0) {
      sceneData.scene_npcs.forEach(npc => {
        if (npc && npc.name) {
          entries.push({
            campaign_id: campaignId,
            user_id: session.user.id,
            tag: 'npc',
            text: [npc.name, npc.role, npc.tone, npc.motivation ? 'Wants: ' + npc.motivation : null]
              .filter(Boolean).join(' — ').slice(0, 200)
          })
        }
      })
    }

    // 3. Environment challenge
    if (sceneData.scene_environment) {
      entries.push({
        campaign_id: campaignId,
        user_id: session.user.id,
        tag: 'environment',
        text: sceneData.scene_environment.slice(0, 200)
      })
    }

    // Insert to Supabase
    const { data: saved, error: memErr } = await supabase
      .from('memories').insert(entries).select()

    if (memErr) {
      console.error('One shot memory error:', memErr.message)
      // Still show in UI
      setMemory(entries.map((e, i) => ({ ...e, id: 'os_' + i, created_at: new Date().toISOString() })))
    } else if (saved) {
      setMemory(saved)
    }
  }

  // ── Handle one shot wizard completion ─────────────────────────────────────
  async function handleOneShotCreate(sceneData) {
    setShowOneShot(false)
    try {
      // Step 1: create the campaign and get real ID back
      const campData = await createCampaign(
        sceneData.name,
        sceneData.system || 'D&D 5e',
        sceneData.lore || '',
        sceneData.rules_reference || '',
        ''
      )

      // Step 2: parse NPCs and set active campaign
      const npcs = sceneData.scene_npcs || []
      const activeCamp = {
        ...campData,
        scene_npcs: npcs,
        scene_environment: sceneData.scene_environment || ''
      }
      setCampaigns(prev => [campData, ...prev])
      setActiveCampaign(activeCamp)
      setTab('session')

      // Step 3: save memory using real campaign ID
      await saveOneShotMemory(campData.id, sceneData)

    } catch (e) {
      alert('Error creating one shot: ' + e.message)
    }
  }

  // ── Update campaign ────────────────────────────────────────────────────────
  async function updateCampaign(id, updates) {
    const { data, error } = await supabase.from('campaigns').update(updates).eq('id', id).select().single()
    if (error) throw new Error(error.message)
    if (data) {
      setCampaigns(prev => prev.map(c => c.id === id ? data : c))
      if (activeCampaign?.id === id) setActiveCampaign(prev => ({ ...prev, ...data }))
    }
  }

  // ── Delete campaign ────────────────────────────────────────────────────────
  async function deleteCampaign(id) {
    await supabase.from('memories').delete().eq('campaign_id', id)
    await supabase.from('campaign_buttons').delete().eq('campaign_id', id)
    await supabase.from('campaigns').delete().eq('id', id)
    setCampaigns(prev => prev.filter(c => c.id !== id))
    if (activeCampaign?.id === id) {
      setActiveCampaign(null); setMemory([]); setButtons([])
    }
  }

  // ── Memory ─────────────────────────────────────────────────────────────────
  async function addMemory(tag, text) {
    if (!activeCampaign) return
    const { data, error } = await supabase.from('memories').insert({
      campaign_id: activeCampaign.id,
      user_id: session.user.id,
      tag, text
    }).select().single()
    if (!error && data) setMemory(prev => [...prev, data])
  }

  async function deleteMemory(id) {
    await supabase.from('memories').delete().eq('id', id)
    setMemory(prev => prev.filter(m => m.id !== id))
  }

  // ── Buttons ────────────────────────────────────────────────────────────────
  async function saveButtons(btns) {
    if (!activeCampaign) return
    setButtons(btns)
    await supabase.from('campaign_buttons').delete().eq('campaign_id', activeCampaign.id)
    if (btns.length) {
      await supabase.from('campaign_buttons').insert(
        btns.map((b, i) => ({
          campaign_id: activeCampaign.id,
          user_id: session.user.id,
          label: b.label, text: b.text, position: i
        }))
      )
    }
  }

  function selectCampaign(camp) {
    const npcs = camp.scene_npcs
      ? (typeof camp.scene_npcs === 'string' ? JSON.parse(camp.scene_npcs) : camp.scene_npcs)
      : []
    setActiveCampaign({ ...camp, scene_npcs: npcs })
    setTab('session')
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={s.app}>
      {showOneShot && (
        <OneShotWizard onClose={() => setShowOneShot(false)} onCreate={handleOneShotCreate} />
      )}

      <div style={s.topbar}>
        <div style={s.logo}>🎲</div>
        <div>
          <div style={s.title}>Co-Game GM</div>
          <div style={s.sub}>Your co-GM at every table</div>
        </div>
        <div style={s.right}>
          <button style={s.osbtn} onClick={() => setShowOneShot(true)}>⚡ One Shot</button>
          <span style={s.gm}>👤 {gmName}</span>
          <button style={s.signout} onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
      </div>

      <div style={s.tabs}>
        {[['session', '▶ Session'], ['campaigns', '📖 Campaigns'], ['memory', '🧠 Memory']].map(([t, l]) => (
          <button key={t} style={tab === t ? s.tabOn : s.tab} onClick={() => setTab(t)}>{l}</button>
        ))}
      </div>

      {tab === 'session' && (
        <Session
          campaign={activeCampaign}
          memory={memory}
          onAddMemory={addMemory}
          onGoToCampaigns={() => setTab('campaigns')}
          buttons={buttons}
          onSaveButtons={saveButtons}
        />
      )}
      {tab === 'campaigns' && (
        <Campaigns
          campaigns={campaigns}
          activeCampaign={activeCampaign}
          onSelect={selectCampaign}
          onCreate={async (name, system, lore, rules, bg) => {
            const data = await createCampaign(name, system, lore, rules, bg)
            setCampaigns(prev => [data, ...prev])
            setActiveCampaign({ ...data, scene_npcs: [] })
            setTab('session')
          }}
          onUpdate={updateCampaign}
          onDelete={deleteCampaign}
        />
      )}
      {tab === 'memory' && (
        <Memory campaign={activeCampaign} memory={memory} onDelete={deleteMemory} />
      )}
    </div>
  )
}
