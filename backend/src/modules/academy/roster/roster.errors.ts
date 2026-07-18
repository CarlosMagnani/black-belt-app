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

export class MemberNotFoundError extends Error {
  constructor() {
    super('Member not found')
    this.name = 'MemberNotFoundError'
  }
}

export class InvalidRoleTransitionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidRoleTransitionError'
  }
}

export class ProfessorTeachesActiveClassError extends Error {
  constructor() {
    super('Professor currently teaches active classes')
    this.name = 'ProfessorTeachesActiveClassError'
  }
}
