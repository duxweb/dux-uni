function toSafeNumber(value: unknown) {
  const numeric = Number(value || 0)
  return Number.isFinite(numeric) ? numeric : 0
}

function padTimeUnit(value: number) {
  return value < 10 ? `0${value}` : String(value)
}

export function formatCurrency(value: unknown, symbol = '¥') {
  const amount = Math.round(toSafeNumber(value))
  const sign = amount < 0 ? '-' : ''
  const integer = Math.abs(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${sign}${symbol}${integer}`
}

export function formatClockTime(value: Date | number | string = Date.now()) {
  const date = value instanceof Date ? value : new Date(value)

  return [
    padTimeUnit(date.getHours()),
    padTimeUnit(date.getMinutes()),
    padTimeUnit(date.getSeconds()),
  ].join(':')
}
