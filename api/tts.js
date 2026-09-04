import { getBronciToken, synthesizeSpeech } from './_bronci.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  try {
    const {
      text,
      textType = 'characters',
      lang = 'hak-xi-TW',
      voice = 'hak-xi-TW-vs2-F01',
      rate = 0.75,
    } = req.body || {}

    if (!text || !String(text).trim()) {
      res.status(400).json({ error: '缺少要朗讀的文字' })
      return
    }

    const token = await getBronciToken()
    const audioBuffer = await synthesizeSpeech({ token, text, textType, lang, voice, rate })

    res.setHeader('Content-Type', 'audio/wav')
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.status(200).send(audioBuffer)
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) })
  }
}
