export type UserRole = 'OWNER' | 'WORKER'
export type UserStatus = 'Active' | 'Inactive'

export interface ManagedUser {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  status: UserStatus
  joinedDate: string
}

export const mockManagedUsers: ManagedUser[] = [
  { id: 'USR-0001', name: 'Demo Owner', email: 'demo@afms.test', phone: '+62 812-3456-7890', role: 'OWNER', status: 'Active', joinedDate: 'Jan 12, 2024' },
  { id: 'USR-0002', name: 'Dimas Pratama', email: 'dimas@afms.test', phone: '+62 813-2200-1144', role: 'WORKER', status: 'Active', joinedDate: 'Mar 08, 2024' },
  { id: 'USR-0003', name: 'Rani Wijaya', email: 'rani@afms.test', phone: '+62 811-7788-2211', role: 'WORKER', status: 'Active', joinedDate: 'Apr 19, 2024' },
  { id: 'USR-0004', name: 'Agus Santoso', email: 'agus@afms.test', phone: '+62 852-4400-8899', role: 'WORKER', status: 'Inactive', joinedDate: 'Jun 02, 2024' },
]
