module.exports = {
  default: `
    --require-module ts-node/register
    --require features/**/*.ts
    --format progress-bar
    --format html:cucumber-report.html
  `
}