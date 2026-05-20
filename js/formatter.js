/* === JSON Formatter & Validator === */

function formatJSON() {
  const input = document.getElementById('fmt-input');
  const output = document.getElementById('fmt-output');
  const status = document.getElementById('fmt-status');
  const indentVal = document.getElementById('fmt-indent').value;
  const indent = indentVal === 'tab' ? '\t' : parseInt(indentVal);

  const raw = input.value.trim();
  if (!raw) {
    showStatus(status, '请输入 JSON 内容', 'error');
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    output.value = JSON.stringify(parsed, null, indent);
    showStatus(status, `✅ JSON 格式正确，已格式化 (${countBytes(output.value)} bytes)`, 'success');
  } catch (e) {
    output.value = '';
    const msg = parseErrorMsg(e.message, raw);
    showStatus(status, `❌ JSON 语法错误: ${msg}`, 'error');
  }
}

function validateJSON() {
  const input = document.getElementById('fmt-input');
  const status = document.getElementById('fmt-status');
  const raw = input.value.trim();

  if (!raw) {
    showStatus(status, '请输入 JSON 内容', 'error');
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    const type = Array.isArray(parsed) ? 'Array' : typeof parsed;
    const keys = typeof parsed === 'object' && parsed !== null ? Object.keys(parsed).length : '—';
    const deep = typeof parsed === 'object' ? deepCount(parsed) : 0;
    showStatus(status, `✅ 有效 JSON · 类型: ${type} · 根级键数: ${keys} · 嵌套节点: ${deep}`, 'success');
  } catch (e) {
    const msg = parseErrorMsg(e.message, raw);
    showStatus(status, `❌ ${msg}`, 'error');
  }
}

function deepCount(obj) {
  if (typeof obj !== 'object' || obj === null) return 1;
  let count = 0;
  for (const val of Object.values(obj)) {
    count += deepCount(val);
  }
  return count + 1;
}

function parseErrorMsg(msg, raw) {
  // Extract position info from error
  const posMatch = msg.match(/position\s+(\d+)/i);
  if (posMatch) {
    const pos = parseInt(posMatch[1]);
    const start = Math.max(0, pos - 15);
    const end = Math.min(raw.length, pos + 15);
    const snippet = raw.substring(start, end);
    const pointer = ' '.repeat(Math.min(pos - start, 30)) + '⬆️';
    return `第 ${pos} 字符附近: ...${snippet}...\n${pointer}`;
  }
  const lineMatch = msg.match(/line\s+(\d+)\s+column\s+(\d+)/i);
  if (lineMatch) {
    return `第 ${lineMatch[1]} 行，第 ${lineMatch[2]} 列`;
  }
  return msg;
}
