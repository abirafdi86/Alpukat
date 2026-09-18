import type { DeliveryMethod, PaymentMethod, PaymentStatus } from '@/types/sales'

export type DateFormat = 'DD/MM/YYYY' | 'DD MMM YYYY'
export type WeightUnit = 'kg' | 'ton'
export type AreaUnit = 'ha' | 'm2'
export type ThemePreference = 'light' | 'dark' | 'system'
export type SettingsSection = 'profile' | 'preferences' | 'farm' | 'sales' | 'notifications' | 'security'

export interface ProfileSettings { photo: string; fullName: string; email: string; phone: string }
export interface UserPreferences { language: 'id' | 'en'; dateFormat: DateFormat; weightUnit: WeightUnit; areaUnit: AreaUnit; theme: ThemePreference }
export interface GradeDescription { id: 'gradeA' | 'gradeB' | 'gradeC' | 'rejected'; descriptionId: string; descriptionEn: string }
export interface FarmSettings { defaultFarmId: string; defaultVariety: string; lowStockThresholdKg: number; grades: GradeDescription[] }
export interface SalesSettings { currency: 'IDR'; defaultPaymentMethod: PaymentMethod; defaultPaymentStatus: Extract<PaymentStatus, 'Paid' | 'Unpaid'>; defaultDeliveryMethod: DeliveryMethod; invoicePrefix: string; defaultInvoiceNotesId: string; defaultInvoiceNotesEn: string }
export interface NotificationSettings { activityDue: boolean; activityOverdue: boolean; activityCompleted: boolean; harvestRecorded: boolean; harvestTarget: boolean; salesStockLow: boolean; inventoryStockLow: boolean; stockOut: boolean; saleRecorded: boolean; paymentReceived: boolean; paymentOutstanding: boolean; orderStatusChanged: boolean }
export interface AppSettings { profile: ProfileSettings; preferences: UserPreferences; farm: FarmSettings; sales: SalesSettings; notifications: NotificationSettings }
