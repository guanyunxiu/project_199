export function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(2) + '万'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'k'
  }
  return num.toLocaleString()
}

export function randomRange(min, max) {
  return Math.random() * (max - min) + min
}

export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item))
  }
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

export default {
  formatTime,
  formatNumber,
  randomRange,
  deepClone
}
