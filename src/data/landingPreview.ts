export interface LandingPreviewMetric {
  labelKey: string
  valueKey: string
  detailKey: string
}

export interface LandingPreviewActivity {
  titleKey: string
  metaKey: string
  tone: 'success' | 'info' | 'warning'
}

export const landingPreviewMetrics: LandingPreviewMetric[] = [
  { labelKey: 'landing.preview.metrics.plants', valueKey: 'landing.preview.metrics.plantsValue', detailKey: 'landing.preview.metrics.plantsDetail' },
  { labelKey: 'landing.preview.metrics.harvest', valueKey: 'landing.preview.metrics.harvestValue', detailKey: 'landing.preview.metrics.harvestDetail' },
  { labelKey: 'landing.preview.metrics.activities', valueKey: 'landing.preview.metrics.activitiesValue', detailKey: 'landing.preview.metrics.activitiesDetail' },
  { labelKey: 'landing.preview.metrics.expenses', valueKey: 'landing.preview.metrics.expensesValue', detailKey: 'landing.preview.metrics.expensesDetail' },
]

export const landingHarvestTrend = [42, 58, 46, 70, 62, 82, 74, 92]

export const landingPreviewActivities: LandingPreviewActivity[] = [
  { titleKey: 'landing.preview.activities.irrigation', metaKey: 'landing.preview.activities.irrigationMeta', tone: 'info' },
  { titleKey: 'landing.preview.activities.harvest', metaKey: 'landing.preview.activities.harvestMeta', tone: 'success' },
  { titleKey: 'landing.preview.activities.stock', metaKey: 'landing.preview.activities.stockMeta', tone: 'warning' },
]
