const { exec } = require('pkg')
const AdmZip = require('adm-zip')
const path = require('path')
const fs = require('fs')
const util = require('util');
const rename = util.promisify(fs.rename);

console.log(process.argv.slice(2))

async function bundle(target, name) {

  console.log(`Bundle: ${target} | name: ${namev}`)

  const binName = (target === 'win')
    ? 'bash-language-server.exe'
    : 'bash-language-server'

  await exec([path.join('node_modules', 'bash-language-server', 'bin', 'main.js'), '--target', target, '--output', path.join('bundle', binName)])

  await moveAddon('tree-sitter-bash', 'tree_sitter_bash_binding.node')
  await moveAddon('tree-sitter', 'tree_sitter_runtime_binding.node')

  // creating archives
  const zip = new AdmZip();

  zip.addLocalFile(path.join('bundle', 'bash-language-server' + (target === 'win' ? '.exe' : '')))
  zip.addLocalFile(path.join('bundle','tree_sitter_bash_binding.node'))
  zip.addLocalFile(path.join('bundle','tree_sitter_runtime_binding.node'))
  zip.writeZip(`bundle/bash-language-server-${name}.zip`)
  console.log(`=> bundle/bash-language-server-${name}.zip`)
}

async function moveAddon(module, filename) {
    await rename(path.join('node_modules', module, 'build', 'Release', filename), path.join('bundle', filename))
}

; (async () => {

  const targets = process.argv.slice(2).map((arg) => {
    if (arg.match(/^ubuntu/)) {
      return ['linux', arg]
    } else if (arg.match(/^windows/)) {
      return ['win', arg]
    } else if (arg.match(/^macos/)) {
      return ['mac', arg]
    }

    return null
  }).filter(a => a)

  for ([t, n] of targets) {
    await bundle(t, n)
  }
})()
