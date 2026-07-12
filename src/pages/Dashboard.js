import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Session from '../components/Session'
import Campaigns from '../components/Campaigns'
import Memory from '../components/Memory'
import OneShotWizard from '../components/OneShotWizard'
import Resources from '../components/Resources'

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
  const [tab, setTab] = useState('campaigns')
  const [campaigns, setCampaigns] = useState([])
  const [activeCampaign, setActiveCampaign] = useState(null)
  const [memory, setMemory] = useState([])
  const [buttons, setButtons] = useState([])
  const [showOneShot, setShowOneShot] = useState(false)

  const gmName = session.user.user_metadata?.display_name || session.user.email.split('@')[0]

  useEffect(() => { loadCampaigns() }, [])
  useEffect(() => {
    if (activeCampaign?.id) {
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
    setButtons(data?.length ? data : [])
  }

  // ── Core campaign creation — returns the created campaign row ──────────────
  async function createCampaign(name, system, lore, rulesRef, bgUrl) {
    const { data, error } = await supabase.from('campaigns').insert({
      user_id: session.user.id,
      name: name || 'Unnamed',
      system: system || 'D&D 5e',
      lore: lore || '',
      rules_reference: rulesRef || '',
      bg_image_url: bgUrl || '',
    }).select().single()
    if (error) throw new Error(error.message)
    return data
  }

  // ── BUILD 10 FIX: saveOneShotMemory — completely standalone ───────────────
  // Called ONLY after createCampaign returns a real row with a real UUID.
  // Takes campaignId (string UUID) and sceneData (object from OneShotWizard).
  // Builds memory entries explicitly and inserts them one by one to isolate failures.
  async function saveOneShotMemory(campaignId, sceneData) {
    const uid = session.user.id
    const errors = []

    // Each section of the One Shot saved as its own memory entry
    // This gives full expandable detail in the Memory tab

    const entries = []

    // Title + tone as plot header
    if (sceneData.name) {
      entries.push({
        tag: 'plot',
        label: 'TITLE',
        text: '🎲 ' + sceneData.name + (sceneData.scene_tone ? ' | Tone: ' + sceneData.scene_tone : '')
      })
    }

    // Setting as location
    if (sceneData.scene_setting) {
      entries.push({ tag: 'location', label: 'SETTING', text: 'Setting: ' + sceneData.scene_setting })
    }

    // Hook, complication, goal as individual plot entries
    if (sceneData.scene_hook) {
      entries.push({ tag: 'plot', label: 'HOOK', text: 'Hook: ' + sceneData.scene_hook })
    }
    if (sceneData.scene_complication) {
      entries.push({ tag: 'plot', label: 'TWIST', text: 'Twist: ' + sceneData.scene_complication })
    }
    if (sceneData.scene_goal) {
      entries.push({ tag: 'plot', label: 'GOAL', text: 'Goal: ' + sceneData.scene_goal })
    }

    // Key rule
    if (sceneData.scene_system_note) {
      entries.push({ tag: 'rule', label: 'KEY RULE', text: 'Key rule: ' + sceneData.scene_system_note })
    }

    // Environment challenge
    if (sceneData.scene_environment) {
      entries.push({ tag: 'environment', label: 'ENVIRONMENT', text: sceneData.scene_environment })
    }

    // Each NPC as separate npc entry
    const npcs = Array.isArray(sceneData.scene_npcs) ? sceneData.scene_npcs : []
    for (const npc of npcs) {
      if (!npc || !npc.name) continue
      entries.push({
        tag: 'npc',
        label: npc.name,
        text: [npc.name, npc.role, npc.tone, npc.motivation ? 'Wants: ' + npc.motivation : '']
          .filter(Boolean).join(' — ')
      })
    }

    // Insert each entry individually so one failure doesn't block others
    for (const entry of entries) {
      const { error } = await supabase.from('memories').insert({
        campaign_id: campaignId,
        user_id: uid,
        tag: entry.tag,
        text: entry.text.slice(0, 500)
      })
      if (error) {
        errors.push(entry.label + ': ' + error.message)
        console.error('B10 memory save failed -', entry.label, error.message)
      }
    }

    if (errors.length) {
      console.error('B10: some memory entries failed:', errors)
    }

    // Reload memory fresh from DB
    await loadMemory(campaignId)
  }

  // ── One Shot wizard complete ───────────────────────────────────────────────
  async function handleOneShotCreate(sceneData) {
    setShowOneShot(false)
    try {
      // Step 1: Create campaign, get real DB row back
      const camp = await createCampaign(
        sceneData.name,
        sceneData.system || 'D&D 5e',
        sceneData.lore || '',
        sceneData.rules_reference || '',
        ''
      )

      // Step 2: Set as active campaign immediately
      const npcs = Array.isArray(sceneData.scene_npcs) ? sceneData.scene_npcs : []
      setCampaigns(prev => [camp, ...prev])
      setActiveCampaign({ ...camp, scene_npcs: npcs })
      setTab('session')

      // Step 3: Save memory using verified campaign ID
      // Small delay to let Supabase settle before inserting children
      await new Promise(resolve => setTimeout(resolve, 300))
      await saveOneShotMemory(camp.id, sceneData)

    } catch (e) {
      console.error('B10: handleOneShotCreate error', e)
      alert('Error creating one shot: ' + e.message)
    }
  }

  // ── Standard campaign create (from Campaigns tab) ─────────────────────────
  async function handleCampaignCreate(name, system, lore, rulesRef, bgUrl) {
    const camp = await createCampaign(name, system, lore, rulesRef, bgUrl)
    setCampaigns(prev => [camp, ...prev])
    setActiveCampaign({ ...camp, scene_npcs: [] })
    setTab('session')
  }

  // ── Update campaign ────────────────────────────────────────────────────────
  async function updateCampaign(id, updates) {
    const { data, error } = await supabase.from('campaigns').update(updates).eq('id', id).select().single()
    if (error) throw new Error(error.message)
    setCampaigns(prev => prev.map(c => c.id === id ? data : c))
    if (activeCampaign?.id === id) setActiveCampaign(prev => ({ ...prev, ...data }))
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

  // ── BUILD 10 FIX: addMemory — saves full text + image URL ─────────────────
  async function addMemory(tag, text) {
    if (!activeCampaign?.id) return
    const { data, error } = await supabase.from('memories').insert({
      campaign_id: activeCampaign.id,
      user_id: session.user.id,
      tag: tag || 'plot',
      text: text || ''
    }).select().single()
    if (error) {
      console.error('B10: addMemory error', error.message)
      return
    }
    if (data) setMemory(prev => [...prev, data])
  }

  async function deleteMemory(id) {
    await supabase.from('memories').delete().eq('id', id)
    setMemory(prev => prev.filter(m => m.id !== id))
  }

  // ── Button persistence ─────────────────────────────────────────────────────
  async function saveButtons(btns) {
    if (!activeCampaign?.id) return
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
        {[['campaigns', '📖 Campaigns'], ['memory', '🧠 Memory'], ['session', '▶ Session'], ['resources', '📚 Resources']].map(([t, l]) => (
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
          onCreate={handleCampaignCreate}
          onUpdate={updateCampaign}
          onDelete={deleteCampaign}
        />
      )}
      {tab === 'memory' && (
        <Memory campaign={activeCampaign} memory={memory} onDelete={deleteMemory} />
      )}
      {tab === 'resources' && <Resources userId={session.user.id} />}
    </div>
  )
}
