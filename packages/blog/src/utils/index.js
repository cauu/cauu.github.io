import moment from 'moment'

export function formatDate (dateTime, dateFormat = 'YYYY-MM-DD') {
  return moment(dateTime).format(dateFormat)
}