const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
function app(lang = 'en') {
  const elements = new Map();
  const get = id => {
    if (!elements.has(id)) elements.set(id, { value: '', textContent: '', classList: {add() {}, remove() {}} });
    return elements.get(id);
  };
  const context = vm.createContext({ Blob, document: {documentElement: {lang}, addEventListener() {}, getElementById: get} });
  for (const file of ['app', 'formatter', 'comparator']) vm.runInContext(fs.readFileSync(path.join(__dirname, '../js', file + '.js'), 'utf8'), context);
  return {context, get};
}
test('comparison renders changes safely and ignores identical properties', () => {
  const {context, get} = app();
  get('cmp-left').value = '{"same":1,"x":"<svg onload=alert(1)>"}';
  get('cmp-right').value = '{"same":1,"x":2}';
  context.compareJSON();
  assert.match(get('cmp-result').textContent, /<svg/);
  assert.doesNotMatch(get('cmp-result').textContent, /same:/);
  assert.match(get('cmp-status').textContent, /1 differences/);
});
test('inherited property names are additions, not changes', () => {
  const {context} = app();
  const diff = context.deepDiff({}, JSON.parse('{"toString":1,"__proto__":2}'), '');
  assert.deepEqual(Array.from(diff, d => d.type), ['added', 'added']);
});
for (const lang of ['en', 'zh-CN']) test(`format, invalid and empty JSON (${lang})`, () => {
  const {context, get} = app(lang);
  get('fmt-indent').value = '2'; get('fmt-input').value = '{"a":1}';
  context.formatJSON(); assert.equal(get('fmt-output').value, '{\n  "a": 1\n}');
  assert.match(get('fmt-status').textContent, lang === 'en' ? /Valid JSON/ : /格式化/);
  for (const value of ['{', '']) {
    get('fmt-input').value = value; context.formatJSON();
    assert.equal(get('fmt-output').value, '');
    assert.match(get('fmt-status').className, /error/);
  }
});
