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
  topRight: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 },
  oneshotBtn: { fontSize: 12, padding: '5px 12px', background: '#1e1a40', border: '1px solid #534AB7', borderRadius: 7, color: '#b4aef5', cursor: 'pointer', fontWeight: 500 },
  gmName: { fontSize: 12, color: '#a49fc8' },
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
  useEffect(() => { if (activeCampaign) { loadMemory(activeCampaign.id); loadButtons(activeCampaign.id) } }, [activeCampaign])

  async function loadCampaigns() {
    const { data } = await supabase.from('campaigns').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
    if (data) setCampaigns(data)
  }

  async function loadMemory(cid) {
    const { data } = await supabase.from('memories').select('*').eq('campaign_id', cid).order('created_at', { ascending: true })
    if (data) setMemory(data)
  }

  async function loadButtons(cid) {
    const { data } = await supabase.from('campaign_buttons').select('*').eq('campaign_id', cid).order('position', { ascending: true })
    if (data && data.length) setButtons(data)
    else setButtons([])
  }

  async function createCampaign(name, system, lore, rulesReference, bgImageUrl, sceneData) {
    const insertData = {
      user_id: session.user.id, name, system,
      lore: lore || '', rules_reference: rulesReference || '',
      bg_image_url: bgImageUrl || '',
      scene_npcs: sceneData?.scene_npcs ? JSON.stringify(sceneData.scene_npcs) : null,
      scene_environment: sceneData?.scene_environment || ''
    }
    const { data, error } = await supabase.from('campaigns').insert(insertData).select().single()
    if (error) throw new Error(error.message)
    if (data) {
      setCampaigns(prev => [data, ...prev])
      const npcs = sceneData?.scene_npcs || []
      setActiveCampaign({ ...data, scene_npcs: npcs })
      setTab('session')
      // Auto-save one shot overview and NPCs to memory
      if (sceneData?.scene_npcs?.length) {
        const memEntries = [
          { campaign_id: data.id, user_id: session.user.id, tag: 'plot', text: 'Scene: ' + name + ' — ' + (sceneData.lore || '').replace(/\n/g, ' ').slice(0, 150) },
          ...sceneData.scene_npcs.map(npc => ({
            campaign_id: data.id, user_id: session.user.id, tag: 'npc',
            text: npc.name + ' — ' + npc.role + ', ' + npc.tone + '. Wants: ' + npc.motivation
          })),
        ]
        if (sceneData.scene_environment) {
          memEntries.push({ campaign_id: data.id, user_id: session.user.id, tag: 'environment', text: sceneData.scene_environment.slice(0, 120) })
        }
        await supabase.from('memories').insert(memEntries)
        setMemory(memEntries.map((m, i) => ({ ...m, id: 'temp_' + i, created_at: new Date().toISOString() })))
      }
    }
  }

  async function updateCampaign(id, updates) {
    const { data, error } = await supabase.from('campaigns').update(updates).eq('id', id).select().single()
    if (error) throw new Error(error.message)
    if (data) {
      setCampaigns(prev => prev.map(c => c.id === id ? data : c))
      if (activeCampaign?.id === id) setActiveCampaign(data)
    }
  }

  async function deleteCampaign(id) {
    await supabase.from('memories').delete().eq('campaign_id', id)
    await supabase.from('campaign_buttons').delete().eq('campaign_id', id)
    await supabase.from('campaigns').delete().eq('id', id)
    setCampaigns(prev => prev.filter(c => c.id !== id))
    if (activeCampaign?.id === id) {
      setActiveCampaign(null)
      setMemory([])
      setButtons([])
    }
  }

  async function addMemory(tag, text) {
    if (!activeCampaign) return
    const { data, error } = await supabase.from('memories').insert({ campaign_id: activeCampaign.id, user_id: session.user.id, tag, text }).select().single()
    if (!error && data) setMemory(prev => [...prev, data])
  }

  async function deleteMemory(id) {
    await supabase.from('memories').delete().eq('id', id)
    setMemory(prev => prev.filter(m => m.id !== id))
  }

  async function saveButtons(btns) {
    if (!activeCampaign) return
    setButtons(btns)
    await supabase.from('campaign_buttons').delete().eq('campaign_id', activeCampaign.id)
    if (btns.length) {
      await supabase.from('campaign_buttons').insert(
        btns.map((b, i) => ({ campaign_id: activeCampaign.id, user_id: session.user.id, label: b.label, text: b.text, position: i }))
      )
    }
  }

  function selectCampaign(camp) {
    const npcs = camp.scene_npcs ? (typeof camp.scene_npcs === 'string' ? JSON.parse(camp.scene_npcs) : camp.scene_npcs) : []
    setActiveCampaign({ ...camp, scene_npcs: npcs })
    setTab('session')
  }

  async function handleOneShotCreate(sceneData) {
    setShowOneShot(false)
    await createCampaign(sceneData.name, sceneData.system || 'D&D 5e', sceneData.lore, sceneData.rules_reference, '', sceneData)

  }

  return (
    <div style={s.app}>
      {showOneShot && <OneShotWizard onClose={() => setShowOneShot(false)} onCreate={handleOneShotCreate} />}

      <div style={s.topbar}>
        <div style={s.logo}>🎲</div>
        <div>
          <div style={s.title}>Co-Game GM</div>
          <div style={s.sub}>Your co-GM at every table</div>
        </div>
        <div style={s.topRight}>
          <button style={s.oneshotBtn} onClick={() => setShowOneShot(true)}>⚡ One Shot</button>
          <span style={s.gmName}>👤 {gmName}</span>
          <button style={s.signout} onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
      </div>

      <div style={s.tabs}>
        {[['session','▶ Session'],['campaigns','📖 Campaigns'],['memory','🧠 Memory']].map(([t,l]) => (
          <button key={t} style={tab === t ? s.tabOn : s.tab} onClick={() => setTab(t)}>{l}</button>
        ))}
      </div>

      {tab === 'session' && <Session campaign={activeCampaign} memory={memory} onAddMemory={addMemory} onGoToCampaigns={() => setTab('campaigns')} buttons={buttons} onSaveButtons={saveButtons} />}
      {tab === 'campaigns' && <Campaigns campaigns={campaigns} activeCampaign={activeCampaign} onSelect={selectCampaign} onCreate={createCampaign} onUpdate={updateCampaign} onDelete={deleteCampaign} />}
      {tab === 'memory' && <Memory campaign={activeCampaign} memory={memory} onDelete={deleteMemory} />}
    </div>
  )
}
