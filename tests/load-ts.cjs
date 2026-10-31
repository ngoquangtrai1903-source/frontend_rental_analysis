const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const { transformSync } = require('next/dist/build/swc')

module.exports = function loadTs(relativePath) {
  const filename = path.resolve(__dirname, '..', relativePath)
  const code = transformSync(fs.readFileSync(filename, 'utf8'), {
    filename,
    jsc: { parser: { syntax: 'typescript', tsx: filename.endsWith('.tsx') }, target: 'es2022', transform: { react: { runtime: 'automatic' } } },
    module: { type: 'commonjs' }
  }).code
  const mod = new Module(filename, module)
  mod.filename = filename
  mod.paths = Module._nodeModulePaths(path.dirname(filename))
  mod._compile(code, filename)
  return mod.exports
}
