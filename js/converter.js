/* === JSON ⇄ YAML ⇄ XML Converter === */

function convert() {
  const input = document.getElementById('conv-input');
  const output = document.getElementById('conv-output');
  const status = document.getElementById('conv-status');
  const direction = document.getElementById('conv-direction').value;

  const raw = input.value.trim();
  if (!raw) {
    showStatus(status, '请输入要转换的内容', 'error');
    return;
  }

  try {
    switch (direction) {
      case 'json2yaml': jsonToYaml(raw, output, status); break;
      case 'yaml2json': yamlToJson(raw, output, status); break;
      case 'json2xml': jsonToXml(raw, output, status); break;
      case 'xml2json': xmlToJson(raw, output, status); break;
    }
  } catch (e) {
    output.value = '';
    showStatus(status, `❌ 转换失败: ${e.message}`, 'error');
  }
}

/* === JSON → YAML === */
function jsonToYaml(raw, output, status) {
  const parsed = JSON.parse(raw);
  const yaml = jsyaml.dump(parsed, { indent: 2, lineWidth: -1, noRefs: true });
  output.value = yaml;
  showStatus(status, `✅ 转换成功: JSON → YAML (${countBytes(yaml)} bytes)`, 'success');
}

/* === YAML → JSON === */
function yamlToJson(raw, output, status) {
  const parsed = jsyaml.load(raw);
  const json = JSON.stringify(parsed, null, 2);
  output.value = json;
  showStatus(status, `✅ 转换成功: YAML → JSON (${countBytes(json)} bytes)`, 'success');
}

/* === JSON → XML === */
function jsonToXml(raw, output, status) {
  const parsed = JSON.parse(raw);
  const xml = objToXml(parsed, 'root');
  const formatted = formatXml(xml);
  output.value = formatted;
  showStatus(status, `✅ 转换成功: JSON → XML (${countBytes(formatted)} bytes)`, 'success');
}

function objToXml(obj, nodeName) {
  if (obj === null || obj === undefined) return '';
  if (typeof obj === 'string') {
    return `<${nodeName}>${escapeXml(obj)}</${nodeName}>`;
  }
  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return `<${nodeName}>${String(obj)}</${nodeName}>`;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => objToXml(item, nodeName)).join('\n');
  }
  if (typeof obj === 'object') {
    const children = Object.entries(obj)
      .map(([key, val]) => objToXml(val, key))
      .join('\n');
    return `<${nodeName}>\n${indent(children)}\n</${nodeName}>`;
  }
  return `<${nodeName}>${escapeXml(String(obj))}</${nodeName}>`;
}

function escapeXml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatXml(xml) {
  let formatted = '';
  let indent = 0;
  const lines = xml.split(/>\s*</);
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (i === 0) line = line + '>';
    else if (i === lines.length - 1) line = '<' + line;
    else line = '<' + line + '>';

    if (line.match(/^<\/\w/)) indent--;
    formatted += '  '.repeat(Math.max(0, indent)) + line + '\n';
    if (line.match(/^<\w[^>]*[^/]?>$/) && !line.match(/^<\/|^\w/)) indent++;
  }
  return formatted.trim();
}

function indent(str) {
  return str.split('\n').map(l => '  ' + l).join('\n');
}

/* === XML → JSON === */
function xmlToJson(raw, output, status) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(raw, 'text/xml');

  const parseError = xmlDoc.querySelector('parsererror');
  if (parseError) {
    throw new Error('XML 格式错误: ' + parseError.textContent);
  }

  const root = xmlDoc.documentElement;
  const result = xmlNodeToObj(root);
  const json = JSON.stringify(result, null, 2);
  output.value = json;
  showStatus(status, `✅ 转换成功: XML → JSON (${countBytes(json)} bytes)`, 'success');
}

function xmlNodeToObj(node) {
  const children = Array.from(node.childNodes).filter(n => n.nodeType === 1); // elements only
  const text = node.childNodes.length === 1 && node.firstChild.nodeType === 3
    ? node.firstChild.textContent.trim() : '';

  if (children.length === 0) {
    // Leaf node - return text content or empty
    const val = text || node.textContent.trim();
    if (val === '') return null;
    const num = Number(val);
    if (!isNaN(num) && val !== '') return num;
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  }

  // Check for repeated children (arrays)
  const names = children.map(c => c.nodeName);
  const uniqueNames = [...new Set(names)];
  const hasRepeated = names.length > uniqueNames.length;

  if (hasRepeated && uniqueNames.length === 1) {
    // Array-like
    return children.map(c => xmlNodeToObj(c));
  }

  // Object
  const obj = {};
  for (const child of children) {
    obj[child.nodeName] = xmlNodeToObj(child);
  }
  return obj;
}
