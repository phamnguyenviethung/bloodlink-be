import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EntityManager } from '@mikro-orm/core';
import { IS_PUBLIC_KEY } from '@/share/decorators/role.decorator';
import { RequestWithUser } from '@/share/types/request.type';
import { Staff, StaffRole } from '@/database/entities/Account.entity';

export const STAFF_ROLES_KEY = 'staffRoles';

export const StaffRoles = (...roles: StaffRole[]) =>
  SetMetadata(STAFF_ROLES_KEY, roles);

@Injectable()
export class StaffRoleGuard implements CanActivate {
  private readonly logger = new Logger(StaffRoleGuard.name);

  constructor(
    private reflector: Reflector,
    private readonly em: EntityManager,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<StaffRole[]>(
      STAFF_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no staff roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const user = req.user;

    // If no user is found, deny access
    if (!user) {
      this.logger.debug('No user found in request');
      return false;
    }

    try {
      // Find the staff associated with this user's account
      const staff = await this.em.findOne(Staff, { account: { id: user.id } });

      if (!staff) {
        this.logger.debug(`Staff not found for user ID: ${user.id}`);
        return false;
      }

      // Check if staff has any of the required roles
      const hasRole = requiredRoles.includes(staff.role);

      if (!hasRole) {
        this.logger.debug(
          `Staff role ${staff.role} not in required roles: ${requiredRoles.join(', ')}`,
        );
      }

      return hasRole;
    } catch (error) {
      this.logger.error('Error checking staff roles:', error);
      return false;
    }
  }
}
