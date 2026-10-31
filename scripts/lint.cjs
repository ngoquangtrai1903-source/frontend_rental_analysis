// Dependency-free baseline lint, not a replacement for ESLint/React hook rules.
const fs = require('node:fs')
const path = require('node:path')
const babel = require('next/dist/compiled/babel/core')
let errors = 0
let files = 0
function inspect(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) { inspect(file); continue }
    if (!/\.(ts|tsx|cjs)$/.test(file)) continue
    files++
    const text = fs.readFileSync(file, 'utf8')
    function report(pos, message) {
      const line = text.slice(0, pos).split('\n').length
      console.error(`${file}:${line}: ${message}`)
      errors++
    }
    try {
      const ast = babel.parseSync(text, { filename: file, configFile: false, babelrc: false, sourceType: 'unambiguous', parserOpts: { plugins: ['typescript', 'jsx'] } })
      babel.traverse(ast, { DebuggerStatement(nodePath) { report(nodePath.node.start, 'Remove debugger statement') } })
    } catch (error) {
      report(error.loc?.index || 0, error.message)
    }
    const marker = /^(<{7}|={7}|>{7})(?: |$)/m.exec(text)
    if (marker) report(marker.index, 'Unresolved merge conflict marker')
  }
}
for (const dir of ['app', 'lib', 'scripts', 'tests']) inspect(dir)
console.log(`Baseline lint: ${files} files, ${errors} errors (syntax, debugger, merge conflicts).`)
process.exitCode = errors ? 1 : 0
