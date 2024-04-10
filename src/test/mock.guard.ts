import { CanActivate, ExecutionContext } from "@nestjs/common";

export class MockJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Mock canActivate method to return true for testing purposes
    return true;
  }
}

export class MockRolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Mock canActivate method to return true for testing purposes
    return true;
  }
}
