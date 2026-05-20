/* === JSON Comparator === */

function compareJSON() {
  const left = document.getElementById('cmp-left');
  const right = document.getElementById('cmp-right');
  const result = document.getElementById('cmp-result');
  const status = document.getElementById('cmp-status');

  const leftRaw = left.value.trim();
  const rightRaw = right.value.trim();

  if (!leftRaw || !rightRaw) {
    showStatus(status, '请同时输入左右两侧的 JSON', 'error');
    result.classList.remove('visible');
    return;
  }

  let leftObj, rightObj;
  try { leftObj = JSON.parse(leftRaw); }
  catch (e) { showStatus(status, `❌ 左侧 JSON 语法错误`, 'error'); result.classList.remove('visible'); return; }
  try { rightObj = JSON.parse(rightRaw); }
  catch (e) { showStatus(status, `❌ 右侧 JSON 语法错误`, 'error'); result.classList.remove('visible'); return; }

  const diff = deepDiff(leftObj, rightObj, '');
  const stats = countDiff(diff);

  if (stats.total === 0) {
    result.textContent = '✅ 两个 JSON 完全一致，没有差异。';
    result.classList.add('visible');
    showStatus(status, '✅ 两个 JSON 完全相同', 'success');
    return;
  }

  let output = `📊 差异统计: +${stats.added} 新增 / -${stats.removed} 删除 / ~${stats.changed} 修改 / =${stats.same} 相同\n\n`;
  for (const d of diff) {
    const icon = d.type === 'added' ? '➕' : d.type === 'removed' ? '➖' : '✏️';
    const cls = d.type === 'added' ? 'diff-added' : d.type === 'removed' ? 'diff-removed' : '';
    if (d.type === 'changed') {
      output += `${icon}  ${d.path}\n  - ${JSON.stringify(d.oldValue)}\n  + ${JSON.stringify(d.newValue)}\n\n`;
    } else {
      output += `${icon}  ${d.path}: ${JSON.stringify(d.value)}\n`;
    }
  }

  result.innerHTML = `<span class="${cls}">${escapeHtml(output)}</span>`;
  result.classList.add('visible');

  const totalMsg = `对比完成: ${stats.total} 处差异 (+${stats.added}/-${stats.removed}/~${stats.changed})`;
  showStatus(status, totalMsg, stats.changed + stats.removed > 0 ? 'info' : 'success');
}

function deepDiff(a, b, path) {
  const results = [];
  if (a === b) {
    results.push({ type: 'same', path, value: a });
    return results;
  }

  if (typeof a !== typeof b || a === null || b === null || Array.isArray(a) !== Array.isArray(b)) {
    results.push({ type: 'changed', path, oldValue: a, newValue: b });
    return results;
  }

  if (typeof a !== 'object') {
    results.push({ type: 'changed', path, oldValue: a, newValue: b });
    return results;
  }

  // Both are objects/arrays
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  const allKeys = new Set([...aKeys, ...bKeys]);

  for (const key of allKeys) {
    const childPath = path ? `${path}.${key}` : key;
    if (!(key in a)) {
      results.push({ type: 'added', path: childPath, value: b[key] });
    } else if (!(key in b)) {
      results.push({ type: 'removed', path: childPath, value: a[key] });
    } else {
      results.push(...deepDiff(a[key], b[key], childPath));
    }
  }
  return results;
}

function countDiff(diff) {
  let added = 0, removed = 0, changed = 0, same = 0;
  for (const d of diff) {
    if (d.type === 'added') added++;
    else if (d.type === 'removed') removed++;
    else if (d.type === 'changed') changed++;
    else same++;
  }
  return { added, removed, changed, same, total: added + removed + changed };
}
