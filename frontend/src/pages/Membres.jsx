import { useEffect, useState, useCallback } from 'react'
import { UserPlus, Search, Edit2, Trash2, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/client'
import { StatusBadge, Spinner, EmptyState, Modal, Field, fcfa } from '../components/ui'

const EMPTY_FORM = { nom: '', telephone: '', date_adhesion: '', cotisation_mensuelle: '' }

export default function Membres() {
  const [membres, setMembres]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [modal, setModal]         = useState(null) // null | 'add' | 'edit'
  const [selected, setSelected]   = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [errors, setErrors]       = useState({})
  const [saving, setSaving]       = useState(false)
  const [confirmDel, setConfirmDel] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    api.get('/membres')
      .then(r => setMembres(r.data))
      .catch(() => toast.error('Impossible de charger les membres'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = membres.filter(m =>
    m.nom.toLowerCase().includes(search.toLowerCase()) ||
    (m.telephone || '').includes(search) ||
    (m.code_membre || '').toLowerCase().includes(search.toLowerCase())
  )

  function openAdd() {
    setForm(EMPTY_FORM); setErrors({}); setModal('add')
  }
  function openEdit(m) {
    setSelected(m)
    setForm({
      nom: m.nom,
      telephone: m.telephone ?? '',
      date_adhesion: m.date_adhesion
        ? m.date_adhesion.split('/').reverse().join('-') // dd/mm/yyyy → yyyy-mm-dd
        : '',
      cotisation_mensuelle: String(m.cotisation_mensuelle),
    })
    setErrors({})
    setModal('edit')
  }
  function closeModal() { setModal(null); setSelected(null) }

  function validate() {
    const e = {}
    if (!form.nom.trim())            e.nom = 'Le nom est requis'
    if (!form.date_adhesion)         e.date_adhesion = "La date d'adhésion est requise"
    if (!form.cotisation_mensuelle || isNaN(+form.cotisation_mensuelle))
      e.cotisation_mensuelle = 'Montant invalide'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    const payload = {
      nom: form.nom.trim(),
      telephone: form.telephone.trim() || null,
      date_adhesion: form.date_adhesion,
      cotisation_mensuelle: +form.cotisation_mensuelle,
    }
    try {
      if (modal === 'add') {
        await api.post('/membres', payload)
        toast.success('Membre ajouté avec succès')
      } else {
        await api.put(`/membres/${selected.id}`, payload)
        toast.success('Membre mis à jour')
      }
      closeModal()
      load()
    } catch (err) {
      toast.error(err.userMessage || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/membres/${id}`)
      toast.success('Membre supprimé')
      setConfirmDel(null)
      load()
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
          <h1 className="page-title">Membres</h1>
          <p className="page-subtitle">{membres.length} membre{membres.length !== 1 ? 's' : ''} enregistré{membres.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <UserPlus size={15} /> Ajouter
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          className="input-field pl-9"
          placeholder="Rechercher par nom, code ou téléphone…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <EmptyState message="Aucun membre trouvé" icon={Users} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['Code', 'Nom', 'Téléphone', 'Adhésion', 'Cotisation/mois', 'Statut', 'Solde', 'Actions']
                    .map(h => <th key={h} className="table-th">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id} className="table-tr">
                    <td className="table-td">
                      <span className="font-mono text-xs text-gold-400">{m.code_membre}</span>
                    </td>
                    <td className="table-td font-medium text-white">{m.nom}</td>
                    <td className="table-td text-white/50">{m.telephone || '—'}</td>
                    <td className="table-td text-white/60">{m.date_adhesion}</td>
                    <td className="table-td">
                      <span className="font-mono text-sm">{fcfa(m.cotisation_mensuelle)}</span>
                    </td>
                    <td className="table-td"><StatusBadge statut={m.statut} /></td>
                    <td className="table-td">
                      <span className={`font-mono text-sm font-semibold ${
                        m.solde > 0 ? 'text-blue-400' : m.solde === 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {m.solde > 0 ? '+' : ''}{fcfa(m.solde)}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <button className="btn-edit" onClick={() => openEdit(m)}>
                          <Edit2 size={12} /> Éditer
                        </button>
                        <button className="btn-danger" onClick={() => setConfirmDel(m)}>
                          <Trash2 size={12} /> Suppr.
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modal && (
        <Modal title={modal === 'add' ? 'Nouveau membre' : 'Modifier le membre'} onClose={closeModal}>
          <div className="space-y-4">
            <Field label="Nom complet *" error={errors.nom}>
              <input className="input-field" value={form.nom} onChange={e => f('nom', e.target.value)} placeholder="Ex: Aminata Diallo" />
            </Field>
            <Field label="Téléphone">
              <input className="input-field" value={form.telephone} onChange={e => f('telephone', e.target.value)} placeholder="+225 07 00 00 00 00" />
            </Field>
            <Field label="Date d'adhésion *" error={errors.date_adhesion}>
              <input type="date" className="input-field" value={form.date_adhesion} onChange={e => f('date_adhesion', e.target.value)} />
            </Field>
            <Field label="Cotisation mensuelle (FCFA) *" error={errors.cotisation_mensuelle}>
              <input type="number" className="input-field" value={form.cotisation_mensuelle} onChange={e => f('cotisation_mensuelle', e.target.value)} placeholder="5000" min="0" />
            </Field>
            <div className="flex gap-3 pt-2">
              <button className="btn-secondary flex-1 justify-center" onClick={closeModal} disabled={saving}>Annuler</button>
              <button className="btn-primary flex-1 justify-center" onClick={handleSave} disabled={saving}>
                {saving ? 'Enregistrement…' : modal === 'add' ? 'Ajouter' : 'Mettre à jour'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Delete */}
      {confirmDel && (
        <Modal title="Confirmer la suppression" onClose={() => setConfirmDel(null)}>
          <p className="text-sm text-white/70 mb-5">
            Supprimer <strong className="text-white">{confirmDel.nom}</strong> et tous ses paiements ? Cette action est irréversible.
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
