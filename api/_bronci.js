import https from 'https'

// BRONCI 伺服器使用自簽憑證，Vercel serverless 預設會拒絕，
// 必須用 rejectUnauthorized:false 的 https.Agent（坑8）。
const insecureAgent = new https.Agent({ rejectUnauthorized: false })

const HOST = '140.113.30.204'
const PORT = 8461 // TTS + 客語/台語 MT 共用（坑19：客語 MT 一定要打這個埠，不是 8751）

function request(path, method, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null
    const req = https.request(
      {
        hostname: HOST,
        port: PORT,
        path,
        method,
        agent: insecureAgent,
        headers: {
          'Content-Type': 'application/json',
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
          ...headers,
        },
      },
      (res) => {
        const chunks = []
        res.on('data', (c) => chunks.push(c))
        res.on('end', () => {
          const buffer = Buffer.concat(chunks)
          resolve({ status: res.statusCode, buffer })
        })
      }
    )
    req.on('error', reject)
    if (data) req.write(data)
    req.end()
  })
}

async function requestJSON(path, method, body, headers) {
  const { status, buffer } = await request(path, method, body, headers)
  try {
    return { status, json: JSON.parse(buffer.toString('utf-8')) }
  } catch {
    return { status, json: null, raw: buffer.toString('utf-8') }
  }
}

// token 存在模組層級變數，同一個溫熱的 lambda instance 之間可以重複使用，
// 減少每次呼叫都要重新登入。冷啟動時會重新登入一次。
let cachedToken = null
let tokenExpiry = 0

export async function getBronciToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken
  const { json } = await requestJSON('/api/v1/tts/login', 'POST', {
    username: process.env.TTS_USERNAME,
    password: process.env.TTS_PASSWORD,
    rememberMe: true,
  })
  const token = json?.token || json?.access_token
  if (!token) throw new Error('BRONCI TTS/MT 登入失敗，請確認 TTS_USERNAME / TTS_PASSWORD 環境變數')
  cachedToken = token
  tokenExpiry = Date.now() + 23 * 60 * 60 * 1000
  return token
}

export async function synthesizeSpeech({ token, text, textType, lang, voice, rate }) {
  const { status, buffer } = await request(
    '/api/v1/tts/synthesize',
    'POST',
    {
      input: { text, textType },
      voice: { model: 'broncitts', languageCode: lang, name: voice },
      audioConfig: { speakingRate: rate },
      outputConfig: { streamMode: 0 },
    },
    { Authorization: `Bearer ${token}` }
  )
  if (status !== 200) throw new Error('TTS 合成失敗（HTTP ' + status + '）')
  return buffer
}
