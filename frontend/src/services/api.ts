import axios from 'axios'
import type { Member, MemberForm, Category, Transaction, TransactionForm } from '../types'

const api = axios.create({ baseURL: '/api' })

// ── Members ──────────────────────────────────────────────
export const membersApi = {
  getAll: () => api.get<Member[]>('/members/').then(r => r.data),
  getById: (id: number) => api.get<Member>(`/members/${id}`).then(r => r.data),
  create: (data: MemberForm) => api.post<Member>('/members/', data).then(r => r.data),
  update: (id: number, data: MemberForm) => api.put<Member>(`/members/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/members/${id}`),
}

// ── Categories ────────────────────────────────────────────
export const categoriesApi = {
  getAll: () => api.get<Category[]>('/categories/').then(r => r.data),
  seed: () => api.post('/categories/seed').then(r => r.data),
}

// ── Transactions ──────────────────────────────────────────
export const transactionsApi = {
  getAll: (params: {
    name_search?: string
    category_name?: string
    date_from?: string
    date_to?: string
  }) => api.get<Transaction[]>('/transactions/', { params }).then(r => r.data),

  getFamily: (memberId: number) =>
    api.get<Transaction[]>(`/transactions/family/${memberId}`).then(r => r.data),

  create: (data: TransactionForm) =>
    api.post<Transaction>('/transactions/', {
      ...data,
      member_id: Number(data.member_id),
      category_id: Number(data.category_id),
      amount: data.amount ? parseFloat(data.amount) : null,
      committee_date: data.committee_date || null,
    }).then(r => r.data),

  delete: (id: number) => api.delete(`/transactions/${id}`),

  exportCsv: (params: {
    name_search?: string
    category_name?: string
    date_from?: string
    date_to?: string
  }) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString()
    window.open(`/api/transactions/export/csv?${query}`, '_blank')
  },
}
