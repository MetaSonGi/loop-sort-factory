/* 컨베이어 분류 퍼즐 — 2026 트렌드 Sort 메카닉 */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const COLORS = [
    { name: '레드',   icon: '🟥', css: '#f85149' },
    { name: '블루',   icon: '🟦', css: '#2f81f7' },
    { name: '그린',   icon: '🟩', css: '#3fb950' },
    { name: '옐로우', icon: '🟨', css: '#d29922' },
  ];
  const EMOJI = ['📦', '🎁', '🧰', '📫'];

  const conveyor = $('conveyor'), binsEl = $('bins');
  let running = false, score = 0, lives = 3, level = 1, sorted = 0, combo = 0;
  let products = [], selected = null, nextId = 1;
  let last = 0, spawnTimer = 0, rafId = 0;

  // 분류함 생성
  COLORS.forEach((c, i) => {
    const b = document.createElement('div');
    b.className = 'bin'; b.dataset.color = i;
    b.innerHTML = `<span class="bin-icon">${c.icon}</span><span class="bin-name">${c.name}</span>`;
    b.style.borderTop = `4px solid ${c.css}`;
    b.addEventListener('click', () => onBinClick(i, b));
    binsEl.appendChild(b);
  });

  function spawnInterval() { return Math.max(700, 1700 - level * 130); }
  function beltSpeed() { return 90 + level * 22; } // px/sec

  function spawn() {
    const ci = Math.floor(Math.random() * COLORS.length);
    const el = document.createElement('div');
    el.className = 'product';
    el.style.background = COLORS[ci].css;
    el.textContent = EMOJI[Math.floor(Math.random() * EMOJI.length)];
    el.style.left = '-60px';
    el.addEventListener('click', (e) => { e.stopPropagation(); onProductClick(p); });
    conveyor.appendChild(el);
    const p = { id: nextId++, color: ci, x: -60, el };
    products.push(p);
  }

  function onProductClick(p) {
    if (!running) return;
    if (selected) selected.el.classList.remove('selected');
    selected = (selected === p) ? null : p;
    if (selected) selected.el.classList.add('selected');
  }

  function onBinClick(ci, binEl) {
    if (!running || !selected) return;
    const p = selected;
    if (p.color === ci) {
      combo++;
      const gain = 10 * level * Math.min(combo, 8);
      score += gain;
      sorted++;
      flash(binEl, 'ok');
      removeProduct(p, true);
      if (sorted % 10 === 0) { level++; updateHud(); toast(`🚀 레벨 ${level}!`); }
    } else {
      combo = 0;
      lives--;
      flash(binEl, 'bad');
      removeProduct(p, false);
      updateHud();
      if (lives <= 0) gameOver();
    }
    selected = null;
    updateHud();
  }

  function flash(el, kind) {
    el.classList.remove('flash-ok', 'flash-bad');
    void el.offsetWidth;
    el.classList.add(kind === 'ok' ? 'flash-ok' : 'flash-bad');
  }

  function removeProduct(p, sortedOk) {
    p.el.remove();
    products = products.filter((q) => q !== p);
    if (selected === p) selected = null;
  }

  function toast(msg) {
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;top:38%;left:50%;transform:translate(-50%,-50%);font-size:30px;font-weight:900;z-index:30;pointer-events:none;';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 900);
  }

  function updateHud() {
    $('score').textContent = score;
    $('level').textContent = level;
    $('combo').textContent = 'x' + Math.max(1, Math.min(combo, 8));
    $('lives').textContent = '❤'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, 3 - lives));
  }

  function loop(t) {
    if (!running) return;
    const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
    last = t;
    spawnTimer += dt * 1000;
    if (spawnTimer >= spawnInterval()) { spawnTimer = 0; spawn(); }
    const W = conveyor.clientWidth;
    const speed = beltSpeed();
    for (const p of [...products]) {
      p.x += speed * dt;
      p.el.style.left = p.x + 'px';
      if (p.x > W - 10) { // 분류 실패
        removeProduct(p, false);
        combo = 0; lives--;
        updateHud();
        if (lives <= 0) { gameOver(); return; }
      }
    }
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    running = true; score = 0; lives = 3; level = 1; sorted = 0; combo = 0;
    products.forEach((p) => p.el.remove());
    products = []; selected = null; spawnTimer = 0; last = performance.now();
    $('overlay').classList.add('hidden');
    updateHud();
    rafId = requestAnimationFrame(loop);
  }

  function gameOver() {
    running = false;
    cancelAnimationFrame(rafId);
    const best = Math.max(score, parseInt(localStorage.getItem('lsf_best') || '0', 10));
    localStorage.setItem('lsf_best', best);
    $('ovTitle').textContent = '🏁 게임 오버';
    $('ovDesc').innerHTML = `최종 점수<div class="big">${score}</div>레벨 ${level} · 최고 기록 ${best}`;
    $('startBtn').textContent = '↺ 다시 하기';
    $('overlay').classList.remove('hidden');
  }

  $('startBtn').addEventListener('click', start);
  conveyor.addEventListener('click', () => {
    if (selected) { selected.el.classList.remove('selected'); selected = null; }
  });
  updateHud();
})();
