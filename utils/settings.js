const PRONOUN_SETTINGS_KEY = 'pronounSettings'

const defaultPronounSettings = {
  includeVosotros: true,
  includeVos: false
}

export function getPronounSettings() {
  try {
    const cached = uni.getStorageSync(PRONOUN_SETTINGS_KEY)
    if (cached) {
      const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached
      return {
        includeVosotros: parsed.includeVosotros !== undefined ? parsed.includeVosotros : defaultPronounSettings.includeVosotros,
        includeVos: parsed.includeVos !== undefined ? parsed.includeVos : defaultPronounSettings.includeVos
      }
    }
  } catch (error) {
    console.warn('读取人称设置失败，使用默认值', error)
  }
  return { ...defaultPronounSettings }
}

export function setPronounSettings(settings = {}) {
  const merged = {
    ...defaultPronounSettings,
    ...settings
  }
  try {
    uni.setStorageSync(PRONOUN_SETTINGS_KEY, JSON.stringify(merged))
  } catch (error) {
    console.error('保存人称设置失败', error)
  }
  return merged
}

export function getDefaultPronounSettings() {
  return { ...defaultPronounSettings }
}
