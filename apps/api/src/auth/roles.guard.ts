import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@voiceguard/shared';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    // For demonstration, we use a custom header to simulate the logged-in user's role.
    const userRole = request.headers['x-mock-role'] as Role;

    if (!userRole) {
      throw new ForbiddenException('No role provided in x-mock-role header');
    }

    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException(`Access denied for role ${userRole}`);
    }

    return true;
  }
}
