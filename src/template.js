import { join } from 'path'
import { readFile, pathExists } from 'fs-extra'
import Handlebars from 'handlebars'

import { removeIndentation } from './utils'

const TEMPLATES_DIR = join(__dirname, '..', 'templates')

Handlebars.registerHelper('json', function (object) {
  return new Handlebars.SafeString(JSON.stringify(object, null, 2))
})

Handlebars.registerHelper('notmerge', function(object) {
  if (object.subject.indexOf('Merge branch ') < 0) {
    return object;
  }
});

async function getTemplate (template) {
  if (await pathExists(template)) {
    return readFile(template, 'utf-8')
  }
  const path = join(TEMPLATES_DIR, template + '.hbs')
  if (await pathExists(path) === false) {
    throw new Error(`Template '${template}' was not found`)
  }
  return readFile(path, 'utf-8')
}

export async function compileTemplate (template, data) {
  const compile = Handlebars.compile(await getTemplate(template))
  if (template === 'json') {
    return compile(data)
  }
  return removeIndentation(compile(data))
}
