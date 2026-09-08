// 15 種動物，資料來源：《客語真好玩》第一冊 第17課「動物」圖字卡
// 每筆包含：客語漢字（送 TTS/顯示用）、對應華語（給文本工具做語音辨識比對或
// 備援翻譯用）、emoji（備用小圖示）、插圖與字卡圖檔路徑、
// 卡片配色 key（對應 utils/colors.js 查表，避免坑25）
// audio：如果有這個欄位，代表這個字的 TTS 發音不準確，改用老師實際錄好的
// 正確客語發音檔（public/audio/ 底下），播放時優先使用這個檔案而不是呼叫 TTS。
export const ANIMALS = [
  { id: 'cat', hanzi: '貓仔', zh: '貓', emoji: '🐱', pic: '/images/pic-0.jpg', card: '/images/card-1.jpg', color: 'rose' },
  { id: 'dog', hanzi: '狗仔', zh: '狗', emoji: '🐶', pic: '/images/pic-2.jpg', card: '/images/card-3.jpg', color: 'amber' },
  { id: 'pig', hanzi: '豬仔', zh: '豬', emoji: '🐷', pic: '/images/pic-4.jpg', card: '/images/card-5.jpg', color: 'pink' },
  { id: 'chicken', hanzi: '雞仔', zh: '雞', emoji: '🐔', pic: '/images/pic-6.jpg', card: '/images/card-7.jpg', color: 'orange', audio: '/audio/chicken.m4a' },
  { id: 'cow', hanzi: '牛仔', zh: '牛', emoji: '🐮', pic: '/images/pic-8.jpg', card: '/images/card-9.jpg', color: 'yellow' },
  { id: 'horse', hanzi: '馬仔', zh: '馬', emoji: '🐴', pic: '/images/pic-10.jpg', card: '/images/card-11.jpg', color: 'stone' },
  { id: 'rabbit', hanzi: '兔仔', zh: '兔子', emoji: '🐰', pic: '/images/pic-12.jpg', card: '/images/card-13.jpg', color: 'lime' },
  { id: 'monkey', hanzi: '猴仔', zh: '猴子', emoji: '🐵', pic: '/images/pic-14.jpg', card: '/images/card-15.jpg', color: 'amber' },
  { id: 'sheep', hanzi: '羊仔', zh: '羊', emoji: '🐑', pic: '/images/pic-16.jpg', card: '/images/card-17.jpg', color: 'teal' },
  { id: 'butterfly', hanzi: '揚蝶仔', zh: '蝴蝶', emoji: '🦋', pic: '/images/pic-18.jpg', card: '/images/card-19.jpg', color: 'orange', audio: '/audio/butterfly.m4a' },
  { id: 'firefly', hanzi: '火焰蟲', zh: '螢火蟲', emoji: '✨', pic: '/images/pic-22.jpg', card: '/images/card-23.jpg', color: 'yellow' },
  { id: 'dragonfly', hanzi: '揚尾仔', zh: '蜻蜓', emoji: '🌾', pic: '/images/pic-24.jpg', card: '/images/card-25.jpg', color: 'sky', audio: '/audio/dragonfly.m4a' },
  { id: 'tiger', hanzi: '老虎', zh: '老虎', emoji: '🐯', pic: '/images/pic-26.jpg', card: '/images/card-27.jpg', color: 'orange' },
  { id: 'lion', hanzi: '獅仔', zh: '獅子', emoji: '🦁', pic: '/images/pic-28.jpg', card: '/images/card-29.jpg', color: 'amber' },
  { id: 'bird', hanzi: '鳥仔', zh: '鳥', emoji: '🐦', pic: '/images/pic-32.jpg', card: '/images/card-33.jpg', color: 'sky' },
]

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function sample(arr, n) {
  return shuffle(arr).slice(0, n)
}
