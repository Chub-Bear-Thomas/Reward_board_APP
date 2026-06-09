/**
 * RPG 装饰元素 SVG 组件
 */

/** 火漆印章 */
export function WaxSeal({ color = '#8b2252', size = 40 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill={color} />
      <circle cx="20" cy="20" r="15" fill={color} stroke="#00000030" strokeWidth="1" />
      {/* 波浪边缘 */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180
        const x = 20 + 17 * Math.cos(angle)
        const y = 20 + 17 * Math.sin(angle)
        return <circle key={i} cx={x} cy={y} r="3" fill={color} />
      })}
      {/* 中心纹章 */}
      <path d="M20 10 L23 17 L30 17 L24 22 L26 29 L20 25 L14 29 L16 22 L10 17 L17 17 Z"
        fill="#c9a84c" stroke="#a8894e" strokeWidth="0.5" />
    </svg>
  )
}

/** 羽毛笔 */
export function FeatherPen({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 2 C16 4, 12 8, 10 12 C8 16, 6 20, 4 22"
        stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M20 2 C18 6, 14 8, 10 12"
        stroke="#c9a84c" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.3" />
      <path d="M4 22 L5 20 L6 22"
        stroke="#5e4427" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* 羽毛纹理 */}
      <path d="M18 4 C16 6, 14 7, 12 9" stroke="#c9a84c" strokeWidth="0.5" opacity="0.5" />
      <path d="M16 6 C14 8, 12 9, 10 11" stroke="#c9a84c" strokeWidth="0.5" opacity="0.5" />
    </svg>
  )
}

/** 钉子装饰 */
export function Nail({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="6" cy="6" r="4" fill="#8b6d38" />
      <circle cx="6" cy="6" r="3" fill="#a8894e" />
      <circle cx="5" cy="5" r="1" fill="#c9a84c" opacity="0.6" />
    </svg>
  )
}

/** 皮质扣带 */
export function LeatherStrap({ width = 100 }: { width?: number }) {
  return (
    <svg width={width} height="16" viewBox={`0 0 ${width} 16`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="3" width={width} height="10" rx="2" fill="#5e4427" />
      <rect x="0" y="4" width={width} height="8" rx="1" fill="#6b4e30" />
      {/* 缝线 */}
      <line x1="4" y1="6" x2={width - 4} y2="6" stroke="#8b6d38" strokeWidth="0.5" strokeDasharray="3 2" />
      <line x1="4" y1="10" x2={width - 4} y2="10" stroke="#8b6d38" strokeWidth="0.5" strokeDasharray="3 2" />
    </svg>
  )
}

/** 公会纹章 */
export function GuildEmblem({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 盾牌外形 */}
      <path d="M24 4 L40 12 L40 28 C40 36, 32 42, 24 44 C16 42, 8 36, 8 28 L8 12 Z"
        fill="#5e4427" stroke="#c9a84c" strokeWidth="2" />
      <path d="M24 8 L36 14 L36 28 C36 34, 30 39, 24 40 C18 39, 12 34, 12 28 L12 14 Z"
        fill="#4a3520" stroke="#a8894e" strokeWidth="1" />
      {/* 剑 */}
      <path d="M24 14 L24 34" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 20 L30 20" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 14 L26 14" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
      {/* 星 */}
      <circle cx="24" cy="28" r="2" fill="#c9a84c" />
    </svg>
  )
}

/** 分隔线装饰 */
export function OrnamentDivider({ width = 200 }: { width?: number }) {
  return (
    <svg width={width} height="16" viewBox={`0 0 ${width} 16`} fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
      <line x1="0" y1="8" x2={width} y2="8" stroke="#c9a84c" strokeWidth="0.5" opacity="0.4" />
      <circle cx={width / 2} cy="8" r="4" fill="none" stroke="#c9a84c" strokeWidth="1" opacity="0.6" />
      <circle cx={width / 2} cy="8" r="1.5" fill="#c9a84c" opacity="0.6" />
      <line x1={width / 2 - 20} y1="8" x2={width / 2 - 8} y2="8" stroke="#c9a84c" strokeWidth="1" opacity="0.4" />
      <line x1={width / 2 + 8} y1="8" x2={width / 2 + 20} y2="8" stroke="#c9a84c" strokeWidth="1" opacity="0.4" />
    </svg>
  )
}
