import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { membersApi, categoriesApi, transactionsApi } from '../services/api'
import type { Member, Category, Transaction, TransactionFilters } from '../types'
import TransactionModal from '../components/TransactionModal'

const today = new Date().toISOString().split('T')[0]
const yearStart = `${new Date().getFullYear()}-01-01`

export default function Dashboard() {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())

  const [filters, setFilters] = useState<TransactionFilters>({
    name_search: '', category_name: '', date_from: yearStart,
    date_to: today, show_all_dates: true,
  })

  const setFilter = (k: keyof TransactionFilters, v: string | boolean) =>
    setFilters(f => ({ ...f, [k]: v }))

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (filters.name_search) params.name_search = filters.name_search
      if (filters.category_name && filters.category_name !== 'كل الفئات')
        params.category_name = filters.category_name
      if (!filters.show_all_dates) {
        if (filters.date_from) params.date_from = filters.date_from
        if (filters.date_to) params.date_to = filters.date_to
      }
      const data = await transactionsApi.getAll(params)
      setTransactions(data)
    } catch {
      toast.error('فشل تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    Promise.all([membersApi.getAll(), categoriesApi.getAll()])
      .then(([m, c]) => { setMembers(m); setCategories(c) })
  }, [])

  const handleDelete = async () => {
    if (selectedRows.size === 0) return
    if (!confirm(`هل تريد حذف ${selectedRows.size} معاملة؟`)) return
    try {
      await Promise.all([...selectedRows].map(id => transactionsApi.delete(id)))
      toast.success('تم الحذف بنجاح')
      setSelectedRows(new Set())
      loadData()
    } catch {
      toast.error('فشل الحذف')
    }
  }

  const handleExport = () => {
    const params: Record<string, string> = {}
    if (filters.name_search) params.name_search = filters.name_search
    if (filters.category_name && filters.category_name !== 'كل الفئات')
      params.category_name = filters.category_name
    if (!filters.show_all_dates) {
      if (filters.date_from) params.date_from = filters.date_from
      if (filters.date_to) params.date_to = filters.date_to
    }
    transactionsApi.exportCsv(params)
  }

  const total = transactions.reduce((s, t) => s + (t.amount ?? 0), 0)

  const toggleRow = (id: number) => {
    setSelectedRows(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-4">
      {/* Filter Card */}
      <div className="card">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="label">🔍 بحث بالاسم</label>
            <input
              className="input"
              placeholder="بحث بالاسم..."
              value={filters.name_search}
              onChange={e => setFilter('name_search', e.target.value)}
            />
          </div>
          <div className="min-w-[150px]">
            <label className="label">الفئة</label>
            <select className="input" value={filters.category_name} onChange={e => setFilter('category_name', e.target.value)}>
              <option value="كل الفئات">كل الفئات</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <input
              type="checkbox"
              id="all_dates"
              checked={filters.show_all_dates}
              onChange={e => setFilter('show_all_dates', e.target.checked)}
              className="w-4 h-4 accent-primary mb-3"
            />
            <label htmlFor="all_dates" className="label mb-3">الكل</label>
          </div>
          {!filters.show_all_dates && (
            <>
              <div>
                <label className="label">من</label>
                <input className="input" type="date" value={filters.date_from} onChange={e => setFilter('date_from', e.target.value)} />
              </div>
              <div>
                <label className="label">إلى</label>
                <input className="input" type="date" value={filters.date_to} onChange={e => setFilter('date_to', e.target.value)} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          ➕ إضافة معاملة جديدة
        </button>
        <button className="btn-secondary" onClick={() => navigate('/members')}>
          👤 إدارة الأعضاء
        </button>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary text-white">
                <th className="px-4 py-3 text-right font-bold">✓</th>
                <th className="px-4 py-3 text-right font-bold">الاسم</th>
                <th className="px-4 py-3 text-right font-bold">الفئة</th>
                <th className="px-4 py-3 text-right font-bold">قرار اللجنة</th>
                <th className="px-4 py-3 text-left font-bold">المبلغ</th>
                <th className="px-4 py-3 text-right font-bold">تاريخ اللجنة</th>
                <th className="px-4 py-3 text-right font-bold">ملاحظات</th>
                <th className="px-4 py-3 text-right font-bold">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">جاري التحميل...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">لا توجد بيانات</td></tr>
              ) : transactions.map((t, i) => (
                <tr
                  key={t.id}
                  className={`border-b border-amber-50 cursor-pointer transition-colors ${
                    selectedRows.has(t.id) ? 'bg-primary/10' : i % 2 === 0 ? 'bg-white hover:bg-amber-50' : 'bg-amber-50/50 hover:bg-amber-100/50'
                  }`}
                  onClick={() => toggleRow(t.id)}
                  onDoubleClick={() => t.member_id && navigate(`/members/${t.member_id}`)}
                >
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedRows.has(t.id)} onChange={() => toggleRow(t.id)} className="accent-primary" onClick={e => e.stopPropagation()} />
                  </td>
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
                  <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{t.notes ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{t.created_at?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-3">
          <button
            className="btn-danger"
            onClick={handleDelete}
            disabled={selectedRows.size === 0}
          >
            🗑️ حذف المحدد ({selectedRows.size})
          </button>
          <button className="btn-secondary" onClick={handleExport}>
            📊 تصدير CSV
          </button>
        </div>
        <div className="bg-primary text-white rounded-xl px-6 py-3 flex items-center gap-3">
          <span className="text-gold font-semibold">إجمالي المساعدات:</span>
          <span className="text-2xl font-bold">
            {total.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
          </span>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <TransactionModal
          members={members}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSave={async (data) => {
            await transactionsApi.create(data)
            toast.success('تمت إضافة المعاملة بنجاح')
            loadData()
          }}
        />
      )}
    </div>
  )
}
