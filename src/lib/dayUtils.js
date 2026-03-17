// Calcula el número de día del plan (1-365) basado en la fecha de inicio del usuario
export function getCurrentDayNumber(planStartDate) {
  const start = new Date(planStartDate)
  const today = new Date()
  start.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24))
  return Math.min(Math.max(diff + 1, 1), 365)
}

// Convierte una fecha a número de día del plan
export function dateToDayNumber(date, planStartDate) {
  const start = new Date(planStartDate)
  const target = new Date(date)
  start.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  const diff = Math.floor((target - start) / (1000 * 60 * 60 * 24))
  return Math.min(Math.max(diff + 1, 1), 365)
}

// Convierte número de día del plan a fecha
export function dayNumberToDate(dayNumber, planStartDate) {
  const start = new Date(planStartDate)
  start.setHours(0, 0, 0, 0)
  const date = new Date(start)
  date.setDate(start.getDate() + dayNumber - 1)
  return date
}

// Formato de fecha para input[type=date]: YYYY-MM-DD
export function toInputDate(date) {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

// Fecha de inicio por defecto: 1 de enero del año actual
export function defaultStartDate() {
  return `${new Date().getFullYear()}-01-01`
}
