/* === JSON Minifier === */

function minifyJSON() {
  const input = document.getElementById('min-input');
  const output = document.getElementById('min-output');
  const status = document.getElementById('min-status');
  const shouldValidate = document.getElementById('min-validate').checked;

  const raw = input.value.trim();
  if (!raw) {
    showStatus(status, '请输入 JSON 内容', 'error');
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    const minified = JSON.stringify(parsed);
    output.value = minified;

    const inSize = new Blob([raw]).size;
    const outSize = new Blob([minified]).size;
    const ratio = ((1 - outSize / inSize) * 100).toFixed(1);
    
    document.getElementById('min-output-size').textContent = formatSize(outSize);
    
    const level = ratio > 30 ? 'success' : ratio > 10 ? 'info' : 'info';
    showStatus(status, `✅ 压缩完成: ${formatSize(inSize)} → ${formatSize(outSize)} (压缩 ${ratio}%)`, level);
  } catch (e) {
    output.value = '';
    const msg = e.message.split('\n')[0];
    showStatus(status, `❌ JSON 语法错误: ${msg}`, 'error');
  }
}

function updateSize(id, badgeId) {
  const el = document.getElementById(id);
  const badge = document.getElementById(badgeId);
  if (el && badge) {
    badge.textContent = formatSize(new Blob([el.value]).size);
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
