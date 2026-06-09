import { useState } from 'react'
import { useGuildStore } from '../store/useGuildStore'
import { REWARD_CATEGORIES } from '../types'

export function Backpack() {
  const { backpack, removeBackpackItem } = useGuildStore()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const filteredItems = selectedCategory
    ? backpack.filter((item) => item.category === selectedCategory)
    : backpack

  // 按物品名聚合
  const groupedItems = filteredItems.reduce<
    Record<string, { name: string; emoji: string; category: string; totalQuantity: number; ids: string[] }>
  >((acc, item) => {
    const key = `${item.name}-${item.emoji}`
    if (!acc[key]) {
      acc[key] = {
        name: item.name,
        emoji: item.emoji,
        category: item.category,
        totalQuantity: 0,
        ids: [],
      }
    }
    acc[key].totalQuantity += item.quantity
    acc[key].ids.push(item.id)
    return acc
  }, {})

  const items = Object.values(groupedItems)

  const handleDelete = (ids: string[]) => {
    ids.forEach((id) => removeBackpackItem(id))
    setDeleteConfirm(null)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h2 className="font-gothic text-xl font-bold text-guild-gold mb-4">
        🎒 冒险者背包
      </h2>

      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded text-sm transition-all ${
            selectedCategory === null
              ? 'bg-guild-gold text-wood-900 font-bold'
              : 'bg-wood-700/50 text-parchment-300 hover:bg-wood-600/50'
          }`}
        >
          全部
        </button>
        {REWARD_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded text-sm transition-all ${
              selectedCategory === cat
                ? 'bg-guild-gold text-wood-900 font-bold'
                : 'bg-wood-700/50 text-parchment-300 hover:bg-wood-600/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 物品网格 */}
      {items.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎒</div>
          <p className="text-parchment-400">
            {backpack.length === 0
              ? '背包空空如也，快去完成委托获取奖励吧！'
              : '该分类下暂无物品'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map((item) => (
            <div
              key={item.name + item.emoji}
              className="quest-card p-3 text-center relative group"
              onContextMenu={(e) => {
                e.preventDefault()
                setDeleteConfirm(item.name + item.emoji)
              }}
            >
              <div className="text-4xl mb-2">{item.emoji}</div>
              <div className="text-sm font-bold text-wood-800 mb-1">{item.name}</div>
              <div className="text-xs text-wood-500">
                ×{item.totalQuantity}
              </div>
              <div className="text-xs text-wood-400 mt-1">{item.category}</div>

              {/* 删除确认 */}
              {deleteConfirm === item.name + item.emoji && (
                <div className="absolute inset-0 bg-parchment-100/95 flex flex-col items-center justify-center rounded">
                  <p className="text-sm text-wood-700 mb-2">丢弃此物品？</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(item.ids)}
                      className="px-3 py-1 bg-guild-crimson text-white rounded text-sm"
                    >
                      丢弃
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1 bg-parchment-300 text-wood-700 rounded text-sm"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
