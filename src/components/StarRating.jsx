export default function StarRating({ count = 0, size = 'text-5xl' }) {
  return (
    <div className={`flex gap-1 ${size}`}>
      {[1, 2, 3].map((n) => (
        <span key={n} className={n <= count ? 'animate-pop' : 'opacity-30'}>
          {n <= count ? '⭐' : '☆'}
        </span>
      ))}
    </div>
  )
}
