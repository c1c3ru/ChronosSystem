const { getYearHolidays } = require('./lib/holidays')

const year = 2026
const holidays = getYearHolidays(year)
console.log('Sample holiday (May 1st):')
const laborDay = holidays.find((h) => h.name === 'Dia do Trabalho')
if (laborDay) {
  console.log('Name:', laborDay.name)
  console.log('Date object:', laborDay.date.toString())
  console.log('ISO String:', laborDay.date.toISOString())
  console.log('Local Date String:', laborDay.date.toLocaleDateString('pt-BR'))
}

const today = new Date()
console.log('\nToday info:')
console.log('Now:', today.toString())
console.log('ISO:', today.toISOString())
console.log('toDateString:', today.toDateString())
