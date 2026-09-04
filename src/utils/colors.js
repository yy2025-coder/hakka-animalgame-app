// Tailwind JIT 只掃描原始碼中「完整字面」的 class 字串。
// 絕對不能用 `bg-${color}-200` 這種樣板字串拼接（坑25），一律用查表方式取得完整 class。
export const CARD_BG = {
  rose: 'bg-rose-200',
  amber: 'bg-amber-200',
  pink: 'bg-pink-200',
  orange: 'bg-orange-200',
  yellow: 'bg-yellow-200',
  stone: 'bg-stone-200',
  lime: 'bg-lime-200',
  teal: 'bg-teal-200',
  green: 'bg-green-200',
  sky: 'bg-sky-200',
}

export const CARD_BG_SOLID = {
  rose: 'bg-rose-400',
  amber: 'bg-amber-400',
  pink: 'bg-pink-400',
  orange: 'bg-orange-400',
  yellow: 'bg-yellow-400',
  stone: 'bg-stone-400',
  lime: 'bg-lime-400',
  teal: 'bg-teal-400',
  green: 'bg-green-400',
  sky: 'bg-sky-400',
}

export const CARD_BORDER = {
  rose: 'border-rose-400',
  amber: 'border-amber-400',
  pink: 'border-pink-400',
  orange: 'border-orange-400',
  yellow: 'border-yellow-400',
  stone: 'border-stone-400',
  lime: 'border-lime-400',
  teal: 'border-teal-400',
  green: 'border-green-400',
  sky: 'border-sky-400',
}

export const CARD_TEXT = {
  rose: 'text-rose-700',
  amber: 'text-amber-700',
  pink: 'text-pink-700',
  orange: 'text-orange-700',
  yellow: 'text-yellow-700',
  stone: 'text-stone-700',
  lime: 'text-lime-700',
  teal: 'text-teal-700',
  green: 'text-green-700',
  sky: 'text-sky-700',
}
