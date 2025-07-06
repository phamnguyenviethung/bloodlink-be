import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EntityManager } from '@mikro-orm/core';
import { IS_PUBLIC_KEY, ROLES_KEY } from '@/share/decorators/role.decorator';
import { RequestWithUser } from '@/share/types/request.type';
import {
  Account,
  Staff,
  StaffRole,
  AccountRole,
} from '@/database/entities/Account.entity';
import { STAFF_ROLES_KEY } from './staffRole.guard';

@Injectable()
export class CombinedRoleGuard implements CanActivate {
  private readonly logger = new Logger(CombinedRoleGuard.name);

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

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredStaffRoles = this.reflector.getAllAndOverride<StaffRole[]>(
      STAFF_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (
      (!requiredRoles || requiredRoles.length === 0) &&
      (!requiredStaffRoles || requiredStaffRoles.length === 0)
    ) {
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
      // Find the account associated with this user
      const account = await this.em.findOne(Account, { id: user.id });

      if (!account) {
        this.logger.debug(`Account not found for user ID: ${user.id}`);
        return false;
      }

      // Check basic account roles first
      if (requiredRoles && requiredRoles.length > 0) {
        const hasAccountRole = requiredRoles.includes(account.role);

        // If user doesn't have required account role, deny access immediately
        if (!hasAccountRole) {
          this.logger.debug(
            `User role ${account.role} not in required roles: ${requiredRoles.join(', ')}`,
          );
          return false;
        }

        // If user has required account role but it's not STAFF, allow access
        if (account.role !== AccountRole.STAFF) {
          this.logger.debug(`Non-staff user ${account.role} granted access`);
          return true;
        }

        // If user has STAFF role, need to check staff-specific roles
        if (account.role === AccountRole.STAFF) {
          // If no specific staff roles required, allow access for any staff
          if (!requiredStaffRoles || requiredStaffRoles.length === 0) {
            this.logger.debug(
              'Staff user granted access (no specific staff roles required)',
            );
            return true;
          }

          // Check staff-specific roles
          const staff = await this.em.findOne(Staff, {
            account: { id: user.id },
          });

          if (!staff) {
            this.logger.debug(`Staff entity not found for user ID: ${user.id}`);
            return false;
          }

          const hasStaffRole = requiredStaffRoles.includes(staff.role);

          if (!hasStaffRole) {
            this.logger.debug(
              `Staff role ${staff.role} not in required staff roles: ${requiredStaffRoles.join(', ')}`,
            );
          } else {
            this.logger.debug(`Staff with role ${staff.role} granted access`);
          }

          return hasStaffRole;
        }
      }

      // If only staff roles are required (no account roles specified)
      if (requiredStaffRoles && requiredStaffRoles.length > 0) {
        // Must be a staff member
        if (account.role !== AccountRole.STAFF) {
          this.logger.debug(`User is not a staff member: ${account.role}`);
          return false;
        }

        const staff = await this.em.findOne(Staff, {
          account: { id: user.id },
        });

        if (!staff) {
          this.logger.debug(`Staff not found for user ID: ${user.id}`);
          return false;
        }

        const hasStaffRole = requiredStaffRoles.includes(staff.role);

        if (!hasStaffRole) {
          this.logger.debug(
            `Staff role ${staff.role} not in required roles: ${requiredStaffRoles.join(', ')}`,
          );
        }

        return hasStaffRole;
      }

      return true;
    } catch (error) {
      this.logger.error('Error checking roles:', error);
      return false;
    }
  }
}
