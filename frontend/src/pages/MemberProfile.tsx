import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { membersApi, transactionsApi } from '../services/api'
import type { Member, Transaction } from '../types'

export default function MemberProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [member, setMember] = useState<Member | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      membersApi.getById(Number(id)),
      transactionsApi.getFamily(Number(id)),
    ]).then(([m, t]) => {
      setMember(m)
      setTransactions(t)
    }).catch(() => toast.error('فشل تحميل البيانات'))
      .finally(() => setLoading(false))
  }, [id])

  const total = transactions.reduce((s, t) => s + (t.amount ?? 0), 0)

  if (loading) return <div className="text-center py-20 text-gray-400">جاري التحميل...</div>
  if (!member) return <div className="text-center py-20 text-gray-400">العضو غير موجود</div>

  const detail = (label: string, value?: string | number | null) => (
    <div>
      <span className="text-primary font-semibold text-sm">{label}</span>
      <div className="text-gray-700 mt-0.5">{value || 'غير متاح'}</div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="btn-secondary text-sm py-2 px-4">
        ← رجوع
      </button>

      {/* Member info card */}
      <div className="card">
        <h2 className="section-title text-2xl mb-6">بيانات العضو</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {detail('الاسم بالكامل', member.name)}
          {detail('رقم العضوية', member.membership_id)}
          {detail('رقم الهاتف', member.phone)}
          {detail('اسم الزوج/الزوجة', member.spouse_name)}
          {detail('العنوان', member.address)}
          {detail('العمل', member.work ? `${member.work} (${member.is_private_work ? 'خاص' : 'حكومي'})` : null)}
          {detail('حالة الإقامة', member.location_status)}
          {member.other_church_name && detail('كنيسة أخرى', member.other_church_name)}
        </div>
      </div>

      {/* Family transactions */}
      <div className="card p-0 overflow-hidden">
        <div className="p-6 pb-0">
          <h3 className="section-title">📜 سجل معاملات الأسرة</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary text-white">
                <th className="px-4 py-3 text-right font-bold">المستفيد</th>
                <th className="px-4 py-3 text-right font-bold">الفئة</th>
                <th className="px-4 py-3 text-right font-bold">قرار اللجنة</th>
                <th className="px-4 py-3 text-left font-bold">المبلغ</th>
                <th className="px-4 py-3 text-right font-bold">تاريخ اللجنة</th>
                <th className="px-4 py-3 text-right font-bold">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">لا توجد معاملات</td></tr>
              ) : transactions.map((t, i) => (
                <tr key={t.id} className={`border-b border-amber-50 ${i % 2 === 0 ? 'bg-white' : 'bg-amber-50/50'}`}>
                  <td className="px-4 py-3 font-medium text-primary">{t.member_name}</td>
                  <td className="px-4 py-3">{t.category_name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      t.committee_decision === 'مالي' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>{t.committee_decision}</span>
                  </td>
                  <td className="px-4 py-3 text-left font-mono">
                    {t.amount != null ? `${t.amount.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م` : '—'}
                  </td>
                  <td className="px-4 py-3">{t.committee_date ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{t.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Footer total */}
        <div className="p-4 flex justify-end">
          <div className="bg-primary text-white rounded-xl px-6 py-3 flex items-center gap-3">
            <span className="text-gold font-semibold">إجمالي المساعدات المستلمة:</span>
            <span className="text-xl font-bold">
              {total.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
