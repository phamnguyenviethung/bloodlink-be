import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/role.decorator';
import { RequestWithUser } from '../types/request.type';
import { EntityManager } from '@mikro-orm/core';
import { Account } from '@/database/entities/Account.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(
    private reflector: Reflector,
    private readonly em: EntityManager,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
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
      // Find the account associated with this user
      const account = await this.em.findOne(Account, { id: user.id });

      if (!account) {
        this.logger.debug(`Account not found for user ID: ${user.id}`);
        return false;
      }

      // Check if user has any of the required roles
      const hasRole = requiredRoles.includes(account.role);

      if (!hasRole) {
        this.logger.debug(
          `User role ${account.role} not in required roles: ${requiredRoles.join(', ')}`,
        );
      }

      return hasRole;
    } catch (error) {
      this.logger.error('Error checking roles:', error);
      return false;
    }
  }
}
