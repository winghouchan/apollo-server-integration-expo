const joinCommandWithFiles = (files) => (command) =>
  `${command} ${files.join(' ')}`

const typeCheck = ['tsc --project tsconfig.json --noEmit']
const lintSource = (files) => ['eslint --fix'].map(joinCommandWithFiles(files))
const prettier = (files) =>
  ['prettier --write --ignore-unknown'].map(joinCommandWithFiles(files))

export default {
  '**/!(*.{js,ts})': (files) => [...prettier(files)],
  '*.js': (files) => [...lintSource(files), ...prettier(files)],
  '*.ts': (files) => [...typeCheck, ...lintSource(files), ...prettier(files)],
}
