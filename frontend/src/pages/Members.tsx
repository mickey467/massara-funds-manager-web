import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { membersApi } from '../services/api'
import type { Member, MemberForm } from '../types'
import MemberModal from '../components/MemberModal'

export default function Members() {
  const navigate = useNavigate()
  const [members, setMembers] = useState<Member[]>([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editMember, setEditMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      setMembers(await membersApi.getAll())
    } catch {
      toast.error('فشل تحميل الأعضاء')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.phone || '').includes(search) ||
    (m.membership_id || '').includes(search)
  )

  const handleSave = async (data: MemberForm) => {
    if (editMember) {
      await membersApi.update(editMember.id, data)
      toast.success('تم تحديث بيانات العضو')
    } else {
      await membersApi.create(data)
      toast.success('تمت إضافة العضو بنجاح')
    }
    load()
  }

  const handleDelete = async (m: Member) => {
    if (!confirm(`هل تريد حذف العضو "${m.name}"؟ سيتم حذف جميع معاملاته.`)) return
    try {
      await membersApi.delete(m.id)
      toast.success('تم حذف العضو')
      load()
    } catch {
      toast.error('فشل الحذف')
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="section-title text-2xl mb-0">👥 قائمة الأعضاء</h1>
        <button className="btn-primary" onClick={() => { setEditMember(null); setShowModal(true) }}>
          ➕ إضافة عضو جديد
        </button>
      </div>

      {/* Search */}
      <div className="card py-4">
        <input
          className="input max-w-md"
          placeholder="بحث بالاسم أو الهاتف أو رقم العضوية..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-primary text-white">
              <th className="px-4 py-3 text-right font-bold">الاسم</th>
              <th className="px-4 py-3 text-right font-bold">رقم العضوية</th>
              <th className="px-4 py-3 text-right font-bold">الهاتف</th>
              <th className="px-4 py-3 text-right font-bold">حالة الإقامة</th>
              <th className="px-4 py-3 text-right font-bold">العمل</th>
              <th className="px-4 py-3 text-center font-bold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">جاري التحميل...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">لا يوجد أعضاء</td></tr>
            ) : filtered.map((m, i) => (
              <tr
                key={m.id}
                className={`border-b border-amber-50 ${i % 2 === 0 ? 'bg-white' : 'bg-amber-50/50'}`}
              >
                <td
                  className="px-4 py-3 font-semibold text-primary cursor-pointer hover:underline"
                  onClick={() => navigate(`/members/${m.id}`)}
                >
                  {m.name}
                </td>
                <td className="px-4 py-3 text-gray-600">{m.membership_id || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{m.phone || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{m.location_status || '—'}</td>
                <td className="px-4 py-3 text-gray-600">
                  {m.work ? `${m.work} (${m.is_private_work ? 'خاص' : 'حكومي'})` : '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      className="text-xs btn-secondary py-1 px-3"
                      onClick={() => navigate(`/members/${m.id}`)}
                    >👁️ عرض</button>
                    <button
                      className="text-xs btn-secondary py-1 px-3"
                      onClick={() => { setEditMember(m); setShowModal(true) }}
                    >✏️ تعديل</button>
                    <button
                      className="text-xs btn-danger py-1 px-3"
                      onClick={() => handleDelete(m)}
                    >🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-500 text-left">
        إجمالي الأعضاء: {filtered.length}
      </div>

      {showModal && (
        <MemberModal
          member={editMember}
          onClose={() => { setShowModal(false); setEditMember(null) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
