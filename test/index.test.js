const util = require('util')
const { expect } = require('chai')

const errors = require('request-promise-core/errors')
require('..')

describe('request-promise-errors-util-inspect', () => {
  it('patches RequestError', () => {
    expect(typeof errors.RequestError.prototype.toJSON).to.equal('function')
    expect(typeof errors.RequestError.prototype[util.inspect.custom]).to.equal('function')
    expect(typeof errors.RequestError.prototype.toJSON).to.equal(
      typeof errors.TransformError.prototype[util.inspect.custom]
    )
  })

  it('patches StatusCodeError', () => {
    expect(typeof errors.StatusCodeError.prototype.toJSON).to.equal('function')
    expect(typeof errors.StatusCodeError.prototype[util.inspect.custom]).to.equal('function')
    expect(typeof errors.StatusCodeError.prototype.toJSON).to.equal(
      typeof errors.TransformError.prototype[util.inspect.custom]
    )
  })

  it('patches TransformError', () => {
    expect(typeof errors.TransformError.prototype.toJSON).to.equal('function')
    expect(typeof errors.TransformError.prototype[util.inspect.custom]).to.equal('function')
    expect(typeof errors.TransformError.prototype.toJSON).to.equal(
      typeof errors.TransformError.prototype[util.inspect.custom]
    )
  })

  describe('with LOG_LEVEL undefined', () => {
    const oldLogLevel = process.env.LOG_LEVEL
    before(() => {
      delete process.env.LOG_LEVEL
    })

    it('generates the correct output', () => {
      const cause = new Error('cause')
      const e = new errors.RequestError(
        cause,
        {
          simple: true,
          xxx: false,
          mmm: 'secret',
          uri: 'URI',
          method: 'POST'
        },
        {
          response: true,
          toJSON() {
            return { responseJson: true }
          }
        }
      )

      const json = e.toJSON()

      expect(json.message).to.equal(e.message)
      expect(json.options).to.deep.equal({ simple: true, uri: 'URI', method: 'POST' })
      expect(json.cause).to.equal(cause)
      expect(json.stack).to.equal(e.stack)
      expect('response' in json).to.equal(false)
    })

    after(() => {
      if (oldLogLevel !== undefined) {
        process.env.LOG_LEVEL = oldLogLevel
      } else {
        delete process.env.LOG_LEVEL
      }
    })
  })

  describe('with LOG_LEVEL=debug', () => {
    const oldLogLevel = process.env.LOG_LEVEL
    before(() => {
      process.env.LOG_LEVEL = 'debug'
    })

    it('generates the correct output', () => {
      const cause = new Error('cause')
      const e = new errors.RequestError(
        cause,
        {
          simple: true,
          xxx: false,
          mmm: 'secret',
          uri: 'URI',
          method: 'POST'
        },
        {
          response: true,
          toJSON() {
            return { responseJson: true }
          }
        }
      )

      const json = e.toJSON()

      expect(json.message).to.equal(e.message)
      expect(json.options).to.deep.equal({ simple: true, uri: 'URI', method: 'POST' })
      expect(json.cause).to.equal(cause)
      expect(json.stack).to.equal(e.stack)
      expect(json.response).to.deep.equal({ responseJson: true })
    })

    after(() => {
      if (oldLogLevel !== undefined) {
        process.env.LOG_LEVEL = oldLogLevel
      } else {
        delete process.env.LOG_LEVEL
      }
    })
  })
})
