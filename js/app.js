/* === App: Tab switching, samples, utilities === */

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
});

/* ---- Tab Navigation ---- */
function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        switchTab(tab.dataset.tab);
      }
    });
  });
}

function switchTab(tabId) {
  // Update tab buttons
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
    t.tabIndex = -1;
  });
  const activeTab = document.querySelector(`.tab[data-tab="${tabId}"]`);
  if (activeTab) {
    activeTab.classList.add('active');
    activeTab.setAttribute('aria-selected', 'true');
    activeTab.tabIndex = 0;
    activeTab.focus();
  }

  // Update panels
  document.querySelectorAll('.tab-panel').forEach(p => {
    p.hidden = true;
    p.classList.remove('active');
  });
  const panel = document.getElementById(`panel-${tabId}`);
  if (panel) {
    panel.hidden = false;
    panel.classList.add('active');
  }
}

/* ---- Sample Data ---- */
function loadSample(target, variant) {
  const samples = {
    fmt: {
      sample: JSON.stringify({
        name: "JSON Toolbox",
        version: "1.0.0",
        description: "在线 JSON 工具集",
        features: ["格式化", "验证", "压缩", "对比", "转换"],
        metadata: {
          author: "dudu",
          license: "MIT",
          created: "2026-05-19",
          tags: ["json", "tool", "developer", "free"]
        },
        stats: {
          users: 1024,
          rating: 4.8,
          isActive: true
        }
      }, null, 2)
    },
    min: {
      sample: JSON.stringify({
        apiVersion: "v2",
        endpoint: "/api/users",
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer token" },
        body: { username: "demo", email: "demo@example.com", role: "admin" }
      }, null, 2)
    },
    cmp: {
      left: JSON.stringify({ name: "Alice", age: 30, city: "Tokyo", skills: ["JS", "Python"] }, null, 2),
      right: JSON.stringify({ name: "Alice", age: 31, city: "Osaka", skills: ["JS", "Rust"], email: "alice@test.com" }, null, 2)
    }
  };

  const textareaMap = {
    'fmt': 'fmt-input',
    'min': 'min-input',
    'cmp-left': 'cmp-left',
    'cmp-right': 'cmp-right'
  };

  const id = textareaMap[target + '-' + variant] || textareaMap[target];
  if (id) {
    document.getElementById(id).value = samples[target]?.[variant] || '';
    if (target === 'min') updateSize('min-input', 'min-input-size');
    // Clear outputs
    const tab = document.querySelector(`.tab[data-tab="${target}"]`);
    if (tab) tab.click();
  }
}

/* ---- Clipboard & Download ---- */
function copyOutput(id) {
  const el = document.getElementById(id);
  if (!el || !el.value) {
    showToast('没有内容可以复制');
    return;
  }
  navigator.clipboard.writeText(el.value).then(() => {
    showToast('✅ 已复制到剪贴板');
  }).catch(() => {
    // Fallback
    el.select();
    document.execCommand('copy');
    showToast('✅ 已复制到剪贴板');
  });
}

function downloadOutput(id, filename) {
  const el = document.getElementById(id);
  if (!el || !el.value) {
    showToast('没有内容可以下载');
    return;
  }
  const blob = new Blob([el.value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  showToast('⬇️ 文件已下载');
}

function clearEditor(id) {
  document.getElementById(id).value = '';
  if (id === 'min-input') updateSize('min-input', 'min-input-size');
}

/* ---- Status Display ---- */
function showStatus(el, msg, type) {
  el.textContent = msg;
  el.className = 'status-bar visible status-' + type;
}

/* ---- Toast ---- */
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

/* ---- Helpers ---- */
function countBytes(str) {
  return new Blob([str]).size;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
