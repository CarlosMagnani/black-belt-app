export class UnauthenticatedError extends Error {
  constructor() {
    super('Authentication required')
    this.name = 'UnauthenticatedError'
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'You do not have permission to perform this action') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

export class ClassNotFoundError extends Error {
  constructor() {
    super('Class schedule not found')
    this.name = 'ClassNotFoundError'
  }
}

export class ClassNotActiveError extends Error {
  constructor() {
    super('This class is no longer active')
    this.name = 'ClassNotActiveError'
  }
}

export class ClassNotTodayError extends Error {
  constructor() {
    super('This class is not scheduled for today')
    this.name = 'ClassNotTodayError'
  }
}

export class NotYetTimeError extends Error {
  constructor() {
    super('The class has not started yet')
    this.name = 'NotYetTimeError'
  }
}

export class AlreadyRejectedError extends Error {
  constructor() {
    super('A previous check-in request for this class was rejected')
    this.name = 'AlreadyRejectedError'
  }
}

export class AlreadyRequestedError extends Error {
  constructor() {
    super('A check-in request already exists for this class')
    this.name = 'AlreadyRequestedError'
  }
}

export class InvalidInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidInputError'
  }
}
