export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = "NotFoundError";
  }
}

export class SessionError extends Error {
  constructor() {
    super("Invalid session token");
    this.name = "SessionError";
  }
}

export class OwnershipError extends Error {
  constructor(userId: string, resourceType: string, resourceId: string | number) {
    super(
      `${userId} attempted to access ${resourceType} with id ${resourceId} without authorisation`,
    );
    this.name = "OwnershipError";
  }
}
