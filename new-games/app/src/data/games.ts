export interface Game {
  id: string;
  title: string;
  category: string;
  rating: number;
  thumbnail: string;
  description: string;
  embedUrl?: string;
  isBuiltIn?: boolean;
  color: string;
}

export const categories = [
  { id: 'all', name: '全部', icon: '🎮' },
  { id: 'action', name: '动作', icon: '⚔️' },
  { id: 'puzzle', name: '益智', icon: '🧩' },
  { id: 'arcade', name: '街机', icon: '🕹️' },
  { id: 'racing', name: '竞速', icon: '🏎️' },
  { id: 'sports', name: '体育', icon: '⚽' },
  { id: 'strategy', name: '策略', icon: '🧠' },
  { id: 'adventure', name: '冒险', icon: '🗺️' },
  { id: 'casual', name: '休闲', icon: '☕' },
];

export const games: Game[] = [
  {
    id: 'snake',
    title: '贪吃蛇',
    category: 'arcade',
    rating: 4.8,
    thumbnail: '🐍',
    description: '经典贪吃蛇游戏，吃掉食物变长，不要撞墙！',
    isBuiltIn: true,
    color: '#4ADE80'
  },
  {
    id: 'tetris',
    title: '俄罗斯方块',
    category: 'puzzle',
    rating: 4.9,
    thumbnail: '🟦',
    description: '经典方块堆叠游戏，消除整行得分。',
    isBuiltIn: true,
    color: '#3B89FF'
  },
  {
    id: 'pacman',
    title: '吃豆人',
    category: 'arcade',
    rating: 4.7,
    thumbnail: '👻',
    description: '躲避幽灵，吃掉所有豆子！',
    isBuiltIn: true,
    color: '#FACC15'
  },
  {
    id: 'pong',
    title: '乒乓球',
    category: 'sports',
    rating: 4.5,
    thumbnail: '🏓',
    description: '经典双人对战乒乓球游戏。',
    isBuiltIn: true,
    color: '#A42EFF'
  },
  {
    id: 'breakout',
    title: '打砖块',
    category: 'arcade',
    rating: 4.6,
    thumbnail: '🧱',
    description: '用球拍击碎所有砖块！',
    isBuiltIn: true,
    color: '#FF3A7A'
  },
  {
    id: 'flappy',
    title: '像素鸟',
    category: 'arcade',
    rating: 4.4,
    thumbnail: '🐦',
    description: '点击飞行，躲避管道！',
    isBuiltIn: true,
    color: '#22D3EE'
  },
  {
    id: 'dino',
    title: '恐龙快跑',
    category: 'arcade',
    rating: 4.7,
    thumbnail: '🦕',
    description: 'Chrome经典离线游戏，跳跃躲避障碍。',
    isBuiltIn: true,
    color: '#84CC16'
  },
  {
    id: 'memory',
    title: '记忆卡片',
    category: 'puzzle',
    rating: 4.5,
    thumbnail: '🃏',
    description: '翻转卡片，找到配对！',
    isBuiltIn: true,
    color: '#F472B6'
  },
  {
    id: 'minesweeper',
    title: '扫雷',
    category: 'puzzle',
    rating: 4.8,
    thumbnail: '💣',
    description: '经典扫雷游戏，找出所有地雷。',
    isBuiltIn: true,
    color: '#6B7280'
  },
  {
    id: 'sudoku',
    title: '数独',
    category: 'puzzle',
    rating: 4.9,
    thumbnail: '🔢',
    description: '填入数字，每行每列不重复。',
    isBuiltIn: true,
    color: '#3B82F6'
  },
  {
    id: '2048',
    title: '2048',
    category: 'puzzle',
    rating: 4.7,
    thumbnail: '🔲',
    description: '滑动合并数字，达到2048！',
    isBuiltIn: true,
    color: '#F59E0B'
  },
  {
    id: 'tictactoe',
    title: '井字棋',
    category: 'strategy',
    rating: 4.3,
    thumbnail: '⭕',
    description: '三子连线获胜！',
    isBuiltIn: true,
    color: '#10B981'
  },
  {
    id: 'connect4',
    title: '四子连珠',
    category: 'strategy',
    rating: 4.6,
    thumbnail: '🔴',
    description: '四子连线获胜！',
    isBuiltIn: true,
    color: '#EF4444'
  },
  {
    id: 'hangman',
    title: '猜单词',
    category: 'puzzle',
    rating: 4.4,
    thumbnail: '📝',
    description: '猜出隐藏的单词！',
    isBuiltIn: true,
    color: '#8B5CF6'
  },
  {
    id: 'whackamole',
    title: '打地鼠',
    category: 'arcade',
    rating: 4.5,
    thumbnail: '🔨',
    description: '快速击打出现的地鼠！',
    isBuiltIn: true,
    color: '#92400E'
  },
  {
    id: 'spaceinvaders',
    title: '太空侵略者',
    category: 'action',
    rating: 4.8,
    thumbnail: '👾',
    description: '经典射击游戏，消灭外星舰队！',
    isBuiltIn: true,
    color: '#A855F7'
  },
  {
    id: 'asteroids',
    title: '小行星',
    category: 'action',
    rating: 4.6,
    thumbnail: '☄️',
    description: '射击小行星，保卫飞船！',
    isBuiltIn: true,
    color: '#6366F1'
  },
  {
    id: 'frogger',
    title: '青蛙过河',
    category: 'arcade',
    rating: 4.5,
    thumbnail: '🐸',
    description: '帮助青蛙安全过马路和河流！',
    isBuiltIn: true,
    color: '#22C55E'
  },
  {
    id: 'simon',
    title: '西蒙记忆',
    category: 'puzzle',
    rating: 4.7,
    thumbnail: '🎵',
    description: '记住并重复颜色序列！',
    isBuiltIn: true,
    color: '#EC4899'
  },
  {
    id: 'slidingpuzzle',
    title: '滑动拼图',
    category: 'puzzle',
    rating: 4.4,
    thumbnail: '🖼️',
    description: '移动方块，完成图片！',
    isBuiltIn: true,
    color: '#14B8A6'
  },
  {
    id: 'chess',
    title: '国际象棋',
    category: 'strategy',
    rating: 4.9,
    thumbnail: '♟️',
    description: '经典策略棋盘游戏。',
    isBuiltIn: true,
    color: '#78716C'
  },
  {
    id: 'checkers',
    title: '跳棋',
    category: 'strategy',
    rating: 4.5,
    thumbnail: '⚫',
    description: '跳过对方棋子，吃掉它们！',
    isBuiltIn: true,
    color: '#DC2626'
  },
  {
    id: 'solitaire',
    title: '纸牌接龙',
    category: 'casual',
    rating: 4.7,
    thumbnail: '🃏',
    description: '经典Windows纸牌游戏。',
    isBuiltIn: true,
    color: '#16A34A'
  },
  {
    id: 'blackjack',
    title: '21点',
    category: 'casual',
    rating: 4.6,
    thumbnail: '🎰',
    description: '尽可能接近21点，但不要爆掉！',
    isBuiltIn: true,
    color: '#B91C1C'
  },
  {
    id: 'wordsearch',
    title: '单词搜索',
    category: 'puzzle',
    rating: 4.4,
    thumbnail: '🔤',
    description: '在字母网格中找到隐藏单词！',
    isBuiltIn: true,
    color: '#0EA5E9'
  },
  {
    id: 'crossword',
    title: '填字游戏',
    category: 'puzzle',
    rating: 4.5,
    thumbnail: '📰',
    description: '根据提示填入单词！',
    isBuiltIn: true,
    color: '#F97316'
  },
  {
    id: 'mahjong',
    title: '麻将连连看',
    category: 'puzzle',
    rating: 4.7,
    thumbnail: '🀄',
    description: '配对相同的麻将牌消除它们！',
    isBuiltIn: true,
    color: '#DC2626'
  },
  {
    id: 'bubble',
    title: '泡泡龙',
    category: 'arcade',
    rating: 4.6,
    thumbnail: '🫧',
    description: '射击泡泡，三个相同颜色消除！',
    isBuiltIn: true,
    color: '#06B6D4'
  },
  {
    id: 'jewel',
    title: '宝石迷阵',
    category: 'puzzle',
    rating: 4.8,
    thumbnail: '💎',
    description: '交换宝石，三个连线消除！',
    isBuiltIn: true,
    color: '#8B5CF6'
  },
  {
    id: 'tower',
    title: '堆塔',
    category: 'arcade',
    rating: 4.5,
    thumbnail: '🏗️',
    description: '精准堆叠方块，建最高塔！',
    isBuiltIn: true,
    color: '#F43F5E'
  },
  {
    id: 'colorjump',
    title: '颜色跳跃',
    category: 'arcade',
    rating: 4.4,
    thumbnail: '🌈',
    description: '跳到正确颜色的平台上！',
    isBuiltIn: true,
    color: '#EC4899'
  },
  {
    id: 'zigzag',
    title: '之字形',
    category: 'arcade',
    rating: 4.3,
    thumbnail: '〰️',
    description: '点击转弯，保持在道路上！',
    isBuiltIn: true,
    color: '#10B981'
  },
  {
    id: 'knifethrow',
    title: '飞刀挑战',
    category: 'arcade',
    rating: 4.5,
    thumbnail: '🎯',
    description: '投掷飞刀，不要击中其他飞刀！',
    isBuiltIn: true,
    color: '#F59E0B'
  }
];

export const featuredGames = games.slice(0, 6);
export const popularGames = games.slice(0, 8);
