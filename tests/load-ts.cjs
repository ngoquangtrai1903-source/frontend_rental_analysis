const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const { transformSync } = require('next/dist/build/swc')

module.exports = function loadTs(relativePath, mocks = {}) {
  const filename = path.resolve(__dirname, '..', relativePath)
  const code = transformSync(fs.readFileSync(filename, 'utf8'), {
    filename,
    jsc: { parser: { syntax: 'typescript', tsx: filename.endsWith('.tsx') }, target: 'es2022', transform: { react: { runtime: 'automatic' } } },
    module: { type: 'commonjs' }
  }).code
  const mod = new Module(filename, module)
  mod.filename = filename
  mod.paths = Module._nodeModulePaths(path.dirname(filename))
  const originalRequire = mod.require.bind(mod)
  mod.require = function (request) {
    if (Object.hasOwn(mocks, request)) return mocks[request]
    if (request.startsWith('@/') || request.startsWith('.')) {
      const base = request.startsWith('@/')
        ? path.resolve(__dirname, '..', request.slice(2))
        : path.resolve(path.dirname(filename), request)
      const source = [base + '.ts', base + '.tsx'].find((file) => fs.existsSync(file))
      if (source) return loadTs(path.relative(path.resolve(__dirname, '..'), source), mocks)
    }
    return originalRequire(request)
  }
  mod._compile(code, filename)
  return mod.exports
}
