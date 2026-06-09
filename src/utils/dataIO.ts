/**
 * 数据导入导出工具
 */

export interface GuildBackupData {
  version: string
  exportedAt: string
  adventurer: any
  quests: any[]
  backpack: any[]
  logs: any[]
}

/**
 * 导出所有数据为 JSON 文件并下载
 */
export function exportData(data: Omit<GuildBackupData, 'version' | 'exportedAt'>): void {
  const backup: GuildBackupData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    ...data,
  }

  const json = JSON.stringify(backup, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `guild-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 从 JSON 文件导入数据
 */
export function importData(): Promise<GuildBackupData> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) {
        reject(new Error('未选择文件'))
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string) as GuildBackupData
          if (!data.version || !data.adventurer) {
            reject(new Error('无效的备份文件'))
            return
          }
          resolve(data)
        } catch {
          reject(new Error('文件解析失败'))
        }
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsText(file)
    }

    input.click()
  })
}
