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
    super('Class not found')
    this.name = 'ClassNotFoundError'
  }
}

export class InvalidInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidInputError'
  }
}

export class InvalidInstructorError extends Error {
  constructor() {
    super('The specified instructor is not a valid owner or professor of this academy')
    this.name = 'InvalidInstructorError'
  }
}
