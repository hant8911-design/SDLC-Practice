// PreToolUse hook: blocks agent edits to files listed in .claude/approved-tests.txt.
// Exit code 2 = block the tool call and show the reason to the agent.
const fs = require('node:fs');
const path = require('node:path');

let input = '';
process.stdin.on('data', (c) => { input += c; });
process.stdin.on('end', () => {
  const { tool_input: toolInput = {} } = JSON.parse(input || '{}');
  const target = (toolInput.file_path || toolInput.notebook_path || '').replace(/\\/g, '/');
  const list = fs.readFileSync(path.join(__dirname, '..', 'approved-tests.txt'), 'utf8');
  const hit = list.split('\n').filter((l) => l && !l.startsWith('#')).map((l) => l.split(/\s+/)[1])
    .find((f) => target.endsWith(f));
  if (hit) {
    console.error(`BLOCKED: ${hit} is an approved test. Do not edit it to make code pass; raise a change request instead.`);
    process.exit(2);
  }
});
