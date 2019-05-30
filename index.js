const util = require('util')

const requestPromiseErrors = require('request-promise-core/errors')

const keys = Object.keys
const defineProperties = Object.defineProperties
const defineProperty = Object.defineProperty

function serializeOptions(options) {
  const result = {}
  if (options.simple !== undefined) {
    result.simple = options.simple
  }
  if (options.uri !== undefined) {
    result.uri = options.uri
  }
  if (options.method !== undefined) {
    result.method = options.method
  }
  return (keys(result).length !== 0 && result) || undefined
}

function register(Class) {
  if (!Class) {
    return
  }

  function ErrorInspection(error) {
    defineProperties(this, {
      name: { value: error.name, configurable: true, writable: true },
      message: { value: error.message, configurable: true, writable: true },
      stack: { value: error.stack, configurable: true, writable: true },
      toString: { value: () => error.toString(), configurable: true, writable: true }
    })
    const loggetSet = new Set()
    loggetSet.add(this)
    loggetSet.add(this.name)
    loggetSet.add(this.message)
    loggetSet.add(this.stack)
    const logLevel = process.env.LOG_LEVEL
    for (const key of Object.keys(error)) {
      if (key in this) {
        continue
      }
      let value = error[key]
      if (value !== null && value !== undefined && !loggetSet.has(value)) {
        loggetSet.add(value)
        if (typeof value === 'object') {
          if (key === 'response') {
            if (logLevel !== 'debug' && logLevel !== 'DEBUG') {
              continue
            }
          } else if (key === 'options') {
            value = serializeOptions(value)
          }
        }
        if (
          !(value instanceof Date) &&
          typeof value[util.inspect.custom] !== 'function' &&
          typeof value.toJSON === 'function'
        ) {
          value = value.toJSON()
        }
        if (value !== undefined && value !== null) {
          this[key] = value
        }
      }
    }
  }

  ErrorInspection.prototype = Object.create(Class.prototype)

  ErrorInspection.prototype.toJSON = undefined
  ErrorInspection.prototype[util.inspect.custom] = undefined

  defineProperty(ErrorInspection.prototype, 'name', { value: Class.name, configurable: true })

  function errorInspection() {
    return new ErrorInspection(this)
  }

  Class.prototype[util.inspect.custom] = errorInspection
  Class.prototype.toJSON = errorInspection
}

register(requestPromiseErrors.RequestError)
register(requestPromiseErrors.StatusCodeError)
register(requestPromiseErrors.TransformError)

module.exports = requestPromiseErrors
