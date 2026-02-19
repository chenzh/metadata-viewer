// Game Data
const games = [
  // Puzzle Games
  { id: 'game-2048', title: '2048', category: 'puzzle', icon: '🔢', description: 'Merge tiles to reach 2048!' },
  { id: 'tetris', title: 'Tetris', category: 'puzzle', icon: '🧱', description: 'Classic block stacking game' },
  { id: 'sudoku', title: 'Sudoku', category: 'puzzle', icon: '📝', description: 'Fill the grid with numbers' },
  { id: 'klotski', title: 'Klotski', category: 'puzzle', icon: '🧩', description: 'Slide blocks to free the target' },
  { id: 'sokoban', title: 'Sokoban', category: 'puzzle', icon: '📦', description: 'Push boxes to target locations' },
  { id: 'snake', title: 'Snake', category: 'puzzle', icon: '🐍', description: 'Eat food and grow longer' },
  { id: 'minesweeper', title: 'Minesweeper', category: 'puzzle', icon: '💣', description: 'Find all mines without exploding' },
  { id: 'match3', title: 'Match 3', category: 'puzzle', icon: '💎', description: 'Match three gems' },
  { id: 'slidingpuzzle', title: 'Sliding Puzzle', category: 'puzzle', icon: '🎲', description: 'Slide tiles into order' },
  { id: 'tower', title: 'Tower Blocks', category: 'puzzle', icon: '🏗️', description: 'Stack blocks perfectly' },
  
  // Action Games
  { id: 'flappy', title: 'Flappy Bird', category: 'action', icon: '🐦', description: 'Fly through pipes' },
  { id: 'breakout', title: 'Breakout', category: 'action', icon: '🧱', description: 'Break all bricks' },
  { id: 'invaders', title: 'Space Invaders', category: 'action', icon: '👾', description: 'Defend Earth from aliens' },
  { id: 'shooter', title: 'Plane Shooter', category: 'action', icon: '✈️', description: 'Shoot enemy planes' },
  { id: 'dino', title: 'Dino Run', category: 'action', icon: '🦖', description: 'Jump over obstacles' },
  { id: 'pacman', title: 'Pac-Man', category: 'action', icon: '🟡', description: 'Eat dots, avoid ghosts' },
  { id: 'asteroids', title: 'Asteroids', category: 'action', icon: '☄️', description: 'Destroy asteroids' },
  { id: 'colorjump', title: 'Color Jump', category: 'action', icon: '🌈', description: 'Jump on matching colors' },
  
  // Casual Games
  { id: 'memory', title: 'Memory Match', category: 'casual', icon: '🃏', description: 'Match pairs of cards' },
  { id: 'linkup', title: 'Link Up', category: 'casual', icon: '🔗', description: 'Connect matching tiles' },
  { id: 'gomoku', title: 'Gomoku', category: 'casual', icon: '⚫', description: 'Five in a row' },
  { id: 'chess', title: 'Chess', category: 'casual', icon: '♟️', description: 'Classic strategy game' },
  { id: 'checkers', title: 'Checkers', category: 'casual', icon: '🔴', description: 'Jump and capture pieces' },
  { id: 'tictactoe', title: 'Tic Tac Toe', category: 'casual', icon: '⭕', description: 'Get three in a row' },
  { id: 'reversi', title: 'Reversi', category: 'casual', icon: '⚪', description: 'Flip opponent pieces' },
  { id: 'dots', title: 'Dots & Boxes', category: 'casual', icon: '⬜', description: 'Connect dots to make boxes' },
  
  // Classic Games
  { id: 'pinball', title: 'Pinball', category: 'classic', icon: '🔵', description: 'Keep the ball in play' },
  { id: 'pong', title: 'Pong', category: 'classic', icon: '🏓', description: 'Classic table tennis' },
  { id: 'maze', title: 'Maze', category: 'classic', icon: '🌀', description: 'Find your way out' },
  { id: 'solitaire', title: 'Solitaire', category: 'classic', icon: '🃏', description: 'Classic card game' },
  { id: 'puzzle', title: 'Jigsaw Puzzle', category: 'classic', icon: '🖼️', description: 'Piece together the image' },
  { id: 'guessnumber', title: 'Guess Number', category: 'classic', icon: '🔢', description: 'Guess the secret number' },
  { id: 'hangman', title: 'Hangman', category: 'classic', icon: '📝', description: 'Guess the word' },
  { id: 'simon', title: 'Simon Says', category: 'classic', icon: '🎵', description: 'Repeat the pattern' },
  { id: 'wordle', title: 'Wordle', category: 'classic', icon: '🔤', description: 'Guess the 5-letter word' }
];

// DOM Elements
const gamesGrid = document.getElementById('games-grid');
const searchInput = document.getElementById('search-input');
const categoryBtns = document.querySelectorAll('.category-btn');
const gameModal = document.getElementById('game-modal');
const modalTitle = document.getElementById('modal-title');
const gameFrame = document.getElementById('game-frame');
const installBtn = document.getElementById('install-btn');
const offlineIndicator = document.getElementById('offline-indicator');

let currentFilter = 'all';
let deferredPrompt = null;

// Initialize
function init() {
  renderGames();
  setupEventListeners();
  setupPWA();
  checkOnlineStatus();
}

// Render Games
function renderGames(filter = 'all', searchTerm = '') {
  const filteredGames = games.filter(game => {
    const matchesCategory = filter === 'all' || game.category === filter;
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  gamesGrid.innerHTML = filteredGames.map(game => `
    <div class="game-card" data-id="${game.id}" data-category="${game.category}">
      <div class="game-thumbnail">${game.icon}</div>
      <div class="game-info">
        <span class="game-category ${game.category}">${getCategoryName(game.category)}</span>
        <h3 class="game-title">${game.title}</h3>
        <p class="game-description">${game.description}</p>
        <a href="games/${game.id}.html" class="play-btn" data-id="${game.id}">
          ▶ Play Now
        </a>
      </div>
    </div>
  `).join('');

  // Add click handlers
  document.querySelectorAll('.play-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openGame(btn.dataset.id);
    });
  });
}

// Get Category Name
function getCategoryName(category) {
  const names = {
    puzzle: 'Puzzle',
    action: 'Action',
    casual: 'Casual',
    classic: 'Classic'
  };
  return names[category] || category;
}

// Open Game Modal
function openGame(gameId) {
  const game = games.find(g => g.id === gameId);
  if (!game) return;

  modalTitle.textContent = game.title;
  gameFrame.src = `games/${gameId}.html`;
  gameModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close Game Modal
function closeGameModal() {
  gameModal.classList.remove('active');
  gameFrame.src = '';
  document.body.style.overflow = '';
}

// Setup Event Listeners
function setupEventListeners() {
  // Category filters
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.category;
      renderGames(currentFilter, searchInput.value);
    });
  });

  // Search
  searchInput.addEventListener('input', (e) => {
    renderGames(currentFilter, e.target.value);
  });

  // Modal close
  document.querySelector('.modal-close').addEventListener('click', closeGameModal);
  gameModal.addEventListener('click', (e) => {
    if (e.target === gameModal) closeGameModal();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && gameModal.classList.contains('active')) {
      closeGameModal();
    }
  });

  // Online/Offline events
  window.addEventListener('online', () => {
    offlineIndicator.classList.remove('show');
  });

  window.addEventListener('offline', () => {
    offlineIndicator.classList.add('show');
  });
}

// Setup PWA
function setupPWA() {
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('Service Worker registered'))
      .catch(err => console.log('Service Worker registration failed'));
  }

  // Install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.classList.remove('hidden');
  });

  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      installBtn.classList.add('hidden');
    }
    deferredPrompt = null;
  });

  // Hide install button if already installed
  window.addEventListener('appinstalled', () => {
    installBtn.classList.add('hidden');
    deferredPrompt = null;
  });
}

// Check Online Status
function checkOnlineStatus() {
  if (!navigator.onLine) {
    offlineIndicator.classList.add('show');
  }
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
