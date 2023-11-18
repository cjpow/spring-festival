var fs = require('fs')
var xlsx = require('node-xlsx')
var path = require('path')

var data = xlsx.parse('./歌单.xlsx')
var table = data.filter(item => item.name === '工作表1')[0].data

const result = []
for (const [rowIndex, rowValue] of Object.entries(table)) {
  if (Number(rowIndex) === 0) continue
  const [name, author] = rowValue
  result.push({
    name,
    author,
    id: +rowIndex
  })
}

fs.writeFile(path.resolve('../src/assets/lang/langJson.json'), JSON.stringify(result), function (err) {
  if (err) {
    console.log('Error! ' + err)
  }
})
