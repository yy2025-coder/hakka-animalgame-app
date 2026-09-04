// 雙模式偵測：本機開發用 Vite proxy + .env；Vercel 部署用 serverless functions + 環境變數。
export const IS_VERCEL = import.meta.env.VITE_DEPLOY_MODE === 'vercel'
export const IS_LOCAL = !IS_VERCEL

export const TTS_BASE = '/tts-api'

// 客語腔調對照（四縣為預設，符合《客語真好玩》教材腔調）
export const HAKKA_VOICES = {
  xi: { languageCode: 'hak-xi-TW', female: 'hak-xi-TW-vs2-F01', male: 'hak-xi-TW-vs2-M01', label: '四縣腔' },
  hoi: { languageCode: 'hak-hoi-TW', female: 'hak-hoi-TW-vs2-F01', male: 'hak-hoi-TW-vs2-M01', label: '海陸腔' },
}
