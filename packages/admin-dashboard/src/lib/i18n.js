import { create } from 'zustand'

// Language store (persisted to localStorage).
export const useLang = create((set) => ({
  lang: localStorage.getItem('dashLang') || 'en',
  setLang: (l) => {
    localStorage.setItem('dashLang', l)
    document.documentElement.lang = l
    set({ lang: l })
  },
}))

const dict = {
  en: {
    // Sidebar sections
    'sec.Overview': 'Overview',
    'sec.Workforce': 'Workforce',
    'sec.Monitoring': 'Monitoring',
    'sec.Alerts & Scheduling': 'Alerts & Scheduling',
    'sec.Administration': 'Administration',
    // Nav items (by id)
    'nav.dashboard': 'Dashboard',
    'nav.analytics': 'Analytics',
    'nav.workers': 'Workers',
    'nav.performance': 'Performance',
    'nav.departments': 'Departments',
    'nav.screenshots': 'Screenshots',
    'nav.activity': 'Activity Logs',
    'nav.timeline': 'Timeline',
    'nav.alerts': 'Alerts',
    'nav.schedules': 'Shift Schedules',
    'nav.shift-management': 'Shift Management',
    'nav.reports': 'Reports',
    'nav.export': 'Export Data',
    'nav.settings': 'Settings',
    'nav.users': 'User Management',
    // Sidebar brand
    'brand.subtitle': 'Workforce Management',
    // Header
    'header.search': 'Search workers, alerts, schedules...',
    'header.role': 'Administrator',
    'header.signout': 'Sign out',
    'header.light': 'Light',
    'header.dark': 'Dark',
    // Login
    'login.title': 'Admin sign in',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.signin': 'Sign in',
    'login.signingin': 'Signing in…',
  },
  ja: {
    'sec.Overview': '概要',
    'sec.Workforce': '従業員',
    'sec.Monitoring': 'モニタリング',
    'sec.Alerts & Scheduling': 'アラートとスケジュール',
    'sec.Administration': '管理',
    'nav.dashboard': 'ダッシュボード',
    'nav.analytics': '分析',
    'nav.workers': '従業員',
    'nav.performance': 'パフォーマンス',
    'nav.departments': '部署',
    'nav.screenshots': 'スクリーンショット',
    'nav.activity': 'アクティビティログ',
    'nav.timeline': 'タイムライン',
    'nav.alerts': 'アラート',
    'nav.schedules': 'シフトスケジュール',
    'nav.shift-management': 'シフト管理',
    'nav.reports': 'レポート',
    'nav.export': 'データエクスポート',
    'nav.settings': '設定',
    'nav.users': 'ユーザー管理',
    'brand.subtitle': '勤務管理',
    'header.search': '従業員、アラート、スケジュールを検索...',
    'header.role': '管理者',
    'header.signout': 'ログアウト',
    'header.light': 'ライト',
    'header.dark': 'ダーク',
    'login.title': '管理者ログイン',
    'login.email': 'メールアドレス',
    'login.password': 'パスワード',
    'login.signin': 'ログイン',
    'login.signingin': 'ログイン中…',
  },
}

/** Hook returning a translate function `t(key)` for the current language. */
export function useT() {
  const lang = useLang((s) => s.lang)
  return (key) => (dict[lang] && dict[lang][key]) || dict.en[key] || key
}
