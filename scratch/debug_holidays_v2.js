// Mocking getYearHolidays logic
const FIXED_HOLIDAYS = [{ name: 'Dia do Trabalho', date: '05-01', type: 'fixed' }]

function getYearHolidays(year) {
  const holidays = []
  FIXED_HOLIDAYS.forEach((h) => {
    const [month, day] = h.date.split('-').map(Number)
    holidays.push({
      name: h.name,
      date: new Date(year, month - 1, day),
      type: 'fixed',
    })
  })
  return holidays
}

const year = 2026
const holidays = getYearHolidays(year)
console.log('Sample holiday (May 1st):')
const laborDay = holidays.find((h) => h.name === 'Dia do Trabalho')
if (laborDay) {
  console.log('Name:', laborDay.name)
  console.log('Date object:', laborDay.date.toString())
  console.log('ISO String:', laborDay.date.toISOString())
  console.log('toDateString:', laborDay.date.toDateString())
}

const today = new Date()
console.log('\nToday info:')
console.log('Now:', today.toString())
console.log('ISO:', today.toISOString())
console.log('toDateString:', today.toDateString())

console.log('\nComparison logic in HolidayNotification.tsx:')
const isToday = laborDay.date.toDateString() === today.toDateString()
console.log('Is Today?', isToday)

if (isToday) {
  console.log('BUG DETECTED: May 1st is being reported as Today on April 30th!')
} else {
  console.log('Correct: May 1st is NOT today.')
}
