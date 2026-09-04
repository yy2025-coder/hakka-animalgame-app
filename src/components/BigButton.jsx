export default function BigButton({ children, onClick, color = 'bg-orange-400', className = '', disabled, ...rest }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-h-[80px] px-6 py-3 rounded-3xl text-white font-bold text-2xl shadow-lg
        active:scale-95 transition-transform duration-150 disabled:opacity-50
        flex items-center justify-center gap-3 ${color} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
