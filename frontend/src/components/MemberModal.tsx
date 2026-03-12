import { useState, useEffect } from 'react'
import type { Member, MemberForm } from '../types'

const LOCATION_OPTIONS = [
  'مقيم في نطاق الكنيسة',
  'كان مقيماً في نطاق الكنيسة',
  'من كنيسة أخرى',
]

const EMPTY: MemberForm = {
  name: '', membership_id: '', phone: '', spouse_name: '',
  address: '', work: '', is_private_work: 0,
  location_status: LOCATION_OPTIONS[0], other_church_name: '',
}

interface Props {
  member?: Member | null
  onClose: () => void
  onSave: (data: MemberForm) => Promise<void>
}

export default function MemberModal({ member, onClose, onSave }: Props) {
  const [form, setForm] = useState<MemberForm>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (member) {
      setForm({
        name: member.name || '',
        membership_id: member.membership_id || '',
        phone: member.phone || '',
        spouse_name: member.spouse_name || '',
        address: member.address || '',
        work: member.work || '',
        is_private_work: member.is_private_work || 0,
        location_status: member.location_status || LOCATION_OPTIONS[0],
        other_church_name: member.other_church_name || '',
      })
    } else {
      setForm(EMPTY)
    }
  }, [member])

  const set = (field: keyof MemberForm, value: string | number) =>
    setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('الاسم مطلوب'); return }
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
          <h2 className="section-title text-2xl mb-6">
            {member ? 'تعديل بيانات العضو' : 'إضافة عضو جديد'}
          </h2>

          {error && <div className="bg-red-50 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">الاسم *</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">رقم العضوية</label>
                <input className="input" value={form.membership_id} onChange={e => set('membership_id', e.target.value)} />
              </div>
              <div>
                <label className="label">رقم الهاتف</label>
                <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">اسم الزوج / الزوجة</label>
              <input className="input" value={form.spouse_name} onChange={e => set('spouse_name', e.target.value)} />
            </div>
            <div>
              <label className="label">العنوان</label>
              <input className="input" value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4 items-end">
              <div>
                <label className="label">العمل</label>
                <input className="input" value={form.work} onChange={e => set('work', e.target.value)} />
              </div>
              <div className="flex items-center gap-2 pb-1">
                <input
                  type="checkbox"
                  id="private_work"
                  checked={form.is_private_work === 1}
                  onChange={e => set('is_private_work', e.target.checked ? 1 : 0)}
                  className="w-4 h-4 accent-primary"
                />
                <label htmlFor="private_work" className="text-sm font-medium text-gray-700">عمل خاص</label>
              </div>
            </div>
            <div>
              <label className="label">حالة الإقامة</label>
              <select className="input" value={form.location_status} onChange={e => set('location_status', e.target.value)}>
                {LOCATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            {form.location_status === 'من كنيسة أخرى' && (
              <div>
                <label className="label">اسم الكنيسة</label>
                <input className="input" placeholder="أدخل اسم الكنيسة..." value={form.other_church_name} onChange={e => set('other_church_name', e.target.value)} />
              </div>
            )}

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
