import { useEffect, useState, useCallback } from 'react'
import { PlusCircle, Search, Edit2, Trash2, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/client'
import { Spinner, EmptyState, Modal, Field, fcfa } from '../components/ui'

const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const EMPTY_FORM = { membre_id: '', mois: '', montant_paye: '', date_paiement: '' }

export default function Cotisations() {
  const [cotisations, setCotisations] = useState([])
  const [membres, setMembres]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [filterMois, setFilterMois]   = useState('')
  const [modal, setModal]             = useState(null)
  const [selected, setSelected]       = useState(null)
  const [form, setForm]               = useState(EMPTY_FORM)
  const [errors, setErrors]           = useState({})
  const [saving, setSaving]           = useState(false)
  const [confirmDel, setConfirmDel]   = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([api.get('/cotisations'), api.get('/membres')])
      .then(([cot, mem]) => {
        setCotisations(cot.data)
        setMembres(mem.data)
      })
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = cotisations.filter(c => {
    const matchSearch = !search ||
      c.membre_nom.toLowerCase().includes(search.toLowerCase()) ||
      c.code_paiement.toLowerCase().includes(search.toLowerCase())
    const matchMois = !filterMois || c.mois === filterMois
    return matchSearch && matchMois
  })

  const totalFiltered = filtered.reduce((s, c) => s + c.montant_paye, 0)

  function openAdd() { setForm(EMPTY_FORM); setErrors({}); setModal('add') }
  function openEdit(c) {
    setSelected(c)
    setForm({
      membre_id: String(c.membre_id),
      mois: c.mois,
      montant_paye: String(c.montant_paye),
      date_paiement: c.date_paiement
        ? c.date_paiement.split('/').reverse().join('-')
        : '',
    })
    setErrors({})
    setModal('edit')
  }
  function closeModal() { setModal(null); setSelected(null) }

  function validate() {
    const e = {}
    if (!form.membre_id)             e.membre_id = 'Sélectionnez un membre'
    if (!form.mois)                  e.mois = 'Sélectionnez un mois'
    if (!form.montant_paye || isNaN(+form.montant_paye)) e.montant_paye = 'Montant invalide'
    if (!form.date_paiement)         e.date_paiement = 'La date est requise'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    const payload = {
      membre_id: +form.membre_id,
      mois: form.mois,
      montant_paye: +form.montant_paye,
      date_paiement: form.date_paiement,
    }
    try {
      if (modal === 'add') {
        await api.post('/cotisations', payload)
        toast.success('Paiement enregistré')
      } else {
        await api.put(`/cotisations/${selected.id}`, payload)
        toast.success('Paiement mis à jour')
      }
      closeModal(); load()
    } catch (err) {
      toast.error(err.userMessage || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/cotisations/${id}`)
      toast.success('Paiement supprimé')
      setConfirmDel(null); load()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Cotisations</h1>
          <p className="page-subtitle">Journal des paiements — {cotisations.length} enregistrement{cotisations.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <PlusCircle size={15} /> Enregistrer
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            className="input-field pl-9"
            placeholder="Rechercher membre ou code paiement…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field w-auto min-w-36"
          value={filterMois}
          onChange={e => setFilterMois(e.target.value)}
        >
          <option value="">Tous les mois</option>
          {MOIS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Summary bar */}
      {filtered.length > 0 && (
        <div className="card px-5 py-3 flex items-center gap-4">
          <span className="text-xs text-white/40">{filtered.length} paiement{filtered.length !== 1 ? 's' : ''}</span>
          <span className="w-px h-4 bg-white/10" />
          <span className="text-sm font-semibold text-gold-400">{fcfa(totalFiltered)} encaissés</span>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <EmptyState message="Aucun paiement trouvé" icon={Wallet} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['Code', 'Membre', 'ID Membre', 'Mois', 'Montant payé', 'Date paiement', 'Actions']
                    .map(h => <th key={h} className="table-th">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="table-tr">
                    <td className="table-td">
                      <span className="font-mono text-xs text-gold-400">{c.code_paiement}</span>
                    </td>
                    <td className="table-td font-medium text-white">{c.membre_nom}</td>
                    <td className="table-td">
                      <span className="font-mono text-xs text-white/40">{c.code_membre}</span>
                    </td>
                    <td className="table-td">
                      <span className="bg-navy-700 text-white/70 px-2 py-0.5 rounded-md text-xs">{c.mois}</span>
                    </td>
                    <td className="table-td">
                      <span className="font-mono text-sm text-emerald-400 font-semibold">{fcfa(c.montant_paye)}</span>
                    </td>
                    <td className="table-td text-white/60">{c.date_paiement}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <button className="btn-edit" onClick={() => openEdit(c)}>
                          <Edit2 size={12} /> Éditer
                        </button>
                        <button className="btn-danger" onClick={() => setConfirmDel(c)}>
                          <Trash2 size={12} /> Suppr.
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-navy-700/30">
                  <td colSpan="4" className="px-4 py-2.5 text-xs text-white/40 font-semibold">TOTAL</td>
                  <td className="px-4 py-2.5 font-mono font-bold text-gold-400">{fcfa(totalFiltered)}</td>
                  <td colSpan="2" />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modal && (
        <Modal title={modal === 'add' ? 'Nouveau paiement' : 'Modifier le paiement'} onClose={closeModal}>
          <div className="space-y-4">
            <Field label="Membre *" error={errors.membre_id}>
              <select className="input-field" value={form.membre_id} onChange={e => f('membre_id', e.target.value)}>
                <option value="">— Sélectionner un membre —</option>
                {membres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
              </select>
            </Field>
            <Field label="Mois *" error={errors.mois}>
              <select className="input-field" value={form.mois} onChange={e => f('mois', e.target.value)}>
                <option value="">— Sélectionner un mois —</option>
                {MOIS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Montant payé (FCFA) *" error={errors.montant_paye}>
              <input type="number" className="input-field" value={form.montant_paye} onChange={e => f('montant_paye', e.target.value)} placeholder="5000" min="0" />
            </Field>
            <Field label="Date du paiement *" error={errors.date_paiement}>
              <input type="date" className="input-field" value={form.date_paiement} onChange={e => f('date_paiement', e.target.value)} />
            </Field>
            <div className="flex gap-3 pt-2">
              <button className="btn-secondary flex-1 justify-center" onClick={closeModal} disabled={saving}>Annuler</button>
              <button className="btn-primary flex-1 justify-center" onClick={handleSave} disabled={saving}>
                {saving ? 'Enregistrement…' : modal === 'add' ? 'Enregistrer' : 'Mettre à jour'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Delete */}
      {confirmDel && (
        <Modal title="Confirmer la suppression" onClose={() => setConfirmDel(null)}>
          <p className="text-sm text-white/70 mb-5">
            Supprimer le paiement <strong className="text-white">{confirmDel.code_paiement}</strong> de <strong className="text-white">{confirmDel.membre_nom}</strong> ({fcfa(confirmDel.montant_paye)}) ?
          </p>
          <div className="flex gap-3">
            <button className="btn-secondary flex-1 justify-center" onClick={() => setConfirmDel(null)}>Annuler</button>
            <button
              className="flex-1 justify-center bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/25 rounded-xl py-2 text-sm font-semibold transition-all flex items-center gap-2"
              onClick={() => handleDelete(confirmDel.id)}
            >
              <Trash2 size={14} /> Supprimer
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
