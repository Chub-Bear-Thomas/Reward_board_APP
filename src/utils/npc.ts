/**
 * NPC 委托人名字生成器
 */

const NPC_FIRST_NAMES = [
  '艾莉丝', '格兰特', '莉莉安', '罗德里克', '索菲亚',
  '阿尔文', '伊莎贝拉', '塞巴斯蒂安', '奥利维亚', '费尔南多',
  '艾米莉亚', '马库斯', '薇尔莉特', '雷恩', '诺艾尔',
  '凯瑟琳', '达里安', '芙蕾雅', '加文', '希尔达',
  '伊恩', '杰西卡', '凯尔', '露西亚', '米拉',
  '娜塔莎', '奥斯汀', '佩内洛普', '昆汀', '罗莎琳德',
]

const NPC_TITLES = [
  '商会会长', '铁匠铺老板', '药剂师', '酒馆老板娘', '图书管理员',
  '守卫队长', '炼金术士', '吟游诗人', '猎人公会会长', '裁缝师傅',
  '面包师', '渔夫', '矿工头领', '草药商人', '占卜师',
  '退役骑士', '流浪法师', '精灵使者', '矮人工匠', '兽人战士',
]

/**
 * 生成随机 NPC 委托人名字
 */
export function generateNpcName(): string {
  const first = NPC_FIRST_NAMES[Math.floor(Math.random() * NPC_FIRST_NAMES.length)]
  const title = NPC_TITLES[Math.floor(Math.random() * NPC_TITLES.length)]
  return `${first}·${title}`
}
