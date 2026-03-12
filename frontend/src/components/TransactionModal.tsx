import { useState, useEffect } from 'react'
import type { Member, Category, TransactionForm } from '../types'

const EMPTY: TransactionForm = {
  member_id: null, category_id: null,
  committee_decision: 'مالي', amount: '',
  committee_date: new Date().toISOString().split('T')[0],
  notes: '',
}

interface Props {
  members: Member[]
  categories: Category[]
  onClose: () => void
  onSave: (data: TransactionForm) => Promise<void>
}

export default function TransactionModal({ members, categories, onClose, onSave }: Props) {
  const [form, setForm] = useState<TransactionForm>(EMPTY)
  const [memberSearch, setMemberSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field: keyof TransactionForm, value: string | number | null) =>
    setForm(f => ({ ...f, [field]: value }))

  useEffect(() => {
    if (form.committee_decision !== 'مالي') set('amount', '')
  }, [form.committee_decision])

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.member_id) { setError('يرجى اختيار العضو'); return }
    if (!form.category_id) { setError('يرجى اختيار الفئة'); return }
    if (form.committee_decision === 'مالي' && !form.amount) {
      setError('يرجى إدخال المبلغ للقرار المالي'); return
    }
    setLoading(true); setError('')
    try {
      await onSave(form)
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="section-title text-2xl mb-6">إضافة معاملة جديدة</h2>

          {error && <div className="bg-red-50 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Member search + select */}
            <div>
              <label className="label">بحث عن عضو</label>
              <input
                className="input mb-2"
                placeholder="ابحث باسم العضو..."
                value={memberSearch}
                onChange={e => setMemberSearch(e.target.value)}
              />
              <select
                className="input"
                value={form.member_id ?? ''}
                onChange={e => set('member_id', Number(e.target.value) || null)}
                required
              >
                <option value="">-- اختر العضو --</option>
                {filteredMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">الفئة</label>
              <select
                className="input"
                value={form.category_id ?? ''}
                onChange={e => set('category_id', Number(e.target.value) || null)}
                required
              >
                <option value="">-- اختر الفئة --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">قرار اللجنة</label>
              <select className="input" value={form.committee_decision} onChange={e => set('committee_decision', e.target.value)}>
                <option value="مالي">مالي</option>
                <option value="مؤجل">مؤجل</option>
              </select>
            </div>

            {form.committee_decision === 'مالي' && (
              <div>
                <label className="label">المبلغ (جنيه)</label>
                <input
                  className="input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={e => set('amount', e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label className="label">تاريخ اللجنة</label>
              <input className="input" type="date" value={form.committee_date} onChange={e => set('committee_date', e.target.value)} />
            </div>

            <div>
              <label className="label">ملاحظات</label>
              <input className="input" placeholder="ملاحظات (اختياري)..." value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1" disabled={loading}>
                {loading ? 'جاري الحفظ...' : 'حفظ'}
              </button>
              <button type="button" className="btn-secondary flex-1" onClick={onClose}>إلغاء</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
