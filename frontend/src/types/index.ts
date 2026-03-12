export interface Member {
  id: number
  name: string
  membership_id?: string
  phone?: string
  spouse_name?: string
  address?: string
  work?: string
  is_private_work: number
  location_status?: string
  other_church_name?: string
}

export interface MemberForm {
  name: string
  membership_id: string
  phone: string
  spouse_name: string
  address: string
  work: string
  is_private_work: number
  location_status: string
  other_church_name: string
}

export interface Category {
  id: number
  name: string
}

export interface Transaction {
  id: number
  member_id: number
  member_name?: string
  category_id: number
  category_name?: string
  committee_decision: string
  amount?: number | null
  committee_date?: string | null
  notes?: string | null
  created_at?: string
}

export interface TransactionForm {
  member_id: number | null
  category_id: number | null
  committee_decision: string
  amount: string
  committee_date: string
  notes: string
}

export interface TransactionFilters {
  name_search: string
  category_name: string
  date_from: string
  date_to: string
  show_all_dates: boolean
}
