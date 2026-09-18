export type ExpenseCategory = 'Fertilizer' | 'Pesticide' | 'Labor' | 'Equipment' | 'Transportation' | 'Maintenance' | 'Utilities' | 'Other'
export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'E-wallet'

export interface Expense {
  id: string
  date: string
  category: ExpenseCategory
  farmId: string
  description: string
  amount: number
  paymentMethod: PaymentMethod
  notes: string
}

export const mockExpenses: Expense[] = [
  { id: 'EXP-0001', date: '2026-09-16', category: 'Fertilizer', farmId: 'FRM-001', description: 'NPK 16-16-16 fertilizer delivery', amount: 9250000, paymentMethod: 'Bank Transfer', notes: 'Monthly fertilizer restock.' },
  { id: 'EXP-0002', date: '2026-09-15', category: 'Labor', farmId: 'FRM-001', description: 'Harvest and pruning team wages', amount: 4800000, paymentMethod: 'Bank Transfer', notes: 'Week 3 field crew payroll.' },
  { id: 'EXP-0003', date: '2026-09-12', category: 'Pesticide', farmId: 'FRM-002', description: 'Neem oil and pest treatment supplies', amount: 1860000, paymentMethod: 'Cash', notes: 'Preventive pest treatment.' },
  { id: 'EXP-0004', date: '2026-09-10', category: 'Transportation', farmId: 'FRM-003', description: 'Produce transport to collection center', amount: 1275000, paymentMethod: 'Cash', notes: 'Three collection trips.' },
  { id: 'EXP-0005', date: '2026-09-08', category: 'Maintenance', farmId: 'FRM-001', description: 'Irrigation pump maintenance', amount: 2150000, paymentMethod: 'Bank Transfer', notes: 'Replaced worn pump seal.' },
  { id: 'EXP-0006', date: '2026-09-05', category: 'Equipment', farmId: 'FRM-002', description: 'New pruning shears and protective gear', amount: 1740000, paymentMethod: 'E-wallet', notes: 'Tools for Block C team.' },
  { id: 'EXP-0007', date: '2026-09-02', category: 'Utilities', farmId: 'FRM-001', description: 'Electricity and water usage', amount: 1385000, paymentMethod: 'Bank Transfer', notes: 'August utility bill.' },
  { id: 'EXP-0008', date: '2026-08-28', category: 'Other', farmId: 'FRM-002', description: 'Harvest crates and collection bags', amount: 2480000, paymentMethod: 'Bank Transfer', notes: 'Packaging for September harvest.' },
  { id: 'EXP-0009', date: '2026-08-22', category: 'Labor', farmId: 'FRM-003', description: 'Orchard clearing team wages', amount: 3200000, paymentMethod: 'Cash', notes: 'Young orchard preparation.' },
  { id: 'EXP-0010', date: '2026-07-18', category: 'Fertilizer', farmId: 'FRM-001', description: 'Organic compost purchase', amount: 3750000, paymentMethod: 'Bank Transfer', notes: 'Applied to Blocks A and B.' },
  { id: 'EXP-0011', date: '2026-06-25', category: 'Maintenance', farmId: 'FRM-002', description: 'Access road grading', amount: 4600000, paymentMethod: 'Bank Transfer', notes: 'Pre-season road maintenance.' },
  { id: 'EXP-0012', date: '2026-05-14', category: 'Other', farmId: 'FRM-001', description: 'Field safety signage', amount: 890000, paymentMethod: 'Cash', notes: 'Replacement signs for farm entrance.' },
]
