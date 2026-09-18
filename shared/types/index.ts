export type EntityId = string
/** ISO 8601 date/time string. */
export type ISODateString = string

export interface BaseEntity {
  id: EntityId
  createdAt: ISODateString
  updatedAt: ISODateString
}

export interface Farm extends BaseEntity { name: string; location: string }
export interface Block extends BaseEntity { farmId: EntityId; name: string }
export interface Tree extends BaseEntity { blockId: EntityId; code: string; plantedAt: ISODateString | null }
export interface Harvest extends BaseEntity { farmId: EntityId; harvestedAt: ISODateString; quantityKg: number }
export interface Activity extends BaseEntity { farmId: EntityId; title: string; scheduledAt: ISODateString; status: 'planned' | 'completed' }
export interface InventoryItem extends BaseEntity { name: string; quantity: number; unit: string }
export interface Expense extends BaseEntity { farmId: EntityId; description: string; amount: number; currency: string; incurredAt: ISODateString }
export interface User extends BaseEntity { name: string; email: string }
export interface Report extends BaseEntity { title: string; generatedAt: ISODateString }
export interface AppSettings { locale: string; currency: string }
