import {
  Account,
  AccountRole,
  Admin,
  Customer,
  Hospital,
  Staff,
} from '@/database/entities/Account.entity';
import { ClerkClient, Invitation } from '@clerk/backend';
import { EntityManager, Transactional } from '@mikro-orm/core';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ClerkWebhookPayload } from '../customer/interfaces';
import { IAuthService } from './interfaces';
import { ClerkClientType } from '@/share/providers/clerk.provider';
import { GetInvitationReqDto } from './dtos';
import { PaginatedResourceResponse } from '@clerk/backend/dist/api/resources/Deserializer';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly em: EntityManager,
    @Inject(ClerkClientType.CLIENT)
    private readonly clerkClient: ClerkClient,
    @Inject(ClerkClientType.ADMIN)
    private readonly clerkAdminClient: ClerkClient,
  ) {}

  @Transactional()
  async syncAdminFromClerkWebhook(data: ClerkWebhookPayload): Promise<void> {
    this.logger.log(
      `Syncing admin ${data.data.email_addresses[0].email_address}`,
    );
    const role = data.data.unsafe_metadata.role || AccountRole.ADMIN;

    await this.clerkAdminClient.users.updateUserMetadata(data.data.id, {
      publicMetadata: { role },
    });

    const account = await this.em.upsert(Account, {
      id: data.data.id,
      firstName: data.data.first_name,
      lastName: data.data.last_name,
      email: data.data.email_addresses[0].email_address,
      role,
    });

    const entity = role === AccountRole.ADMIN ? Admin : Staff;

    await this.em.upsert(entity, {
      id: data.data.id,
      account,
    });

    this.logger.log(
      `Admin ${data.data.email_addresses[0].email_address} synced`,
    );
  }

  @Transactional()
  async synCustomerFromClerkWebhook(data: ClerkWebhookPayload): Promise<void> {
    this.logger.log(
      `Syncing customer ${data.data.email_addresses[0].email_address}`,
    );

    const role = data.data.unsafe_metadata.role || AccountRole.USER;

    await this.clerkClient.users.updateUserMetadata(data.data.id, {
      publicMetadata: { role },
    });

    const account = await this.em.upsert(Account, {
      id: data.data.id,
      firstName: data.data.first_name,
      lastName: data.data.last_name,
      email: data.data.email_addresses[0].email_address,
      role,
    });

    const entity = role === AccountRole.USER ? Customer : Hospital;

    await this.em.upsert(entity, {
      id: data.data.id,
      account,
    });

    this.logger.log(
      `Customer ${data.data.email_addresses[0].email_address} synced`,
    );
  }

  async inviteHospitalAndStaff(
    email: string,
    role: AccountRole,
  ): Promise<void> {
    const isExist = await this.em.findOne(Account, {
      email: email,
    });

    if (isExist) {
      throw new BadRequestException('User already exists');
    }

    try {
      if (role === AccountRole.HOSPITAL) {
        await this.clerkAdminClient.invitations.createInvitation({
          emailAddress: email,
          publicMetadata: { role },
        });
      } else {
        await this.clerkClient.invitations.createInvitation({
          emailAddress: email,
          publicMetadata: { role },
        });
      }

      this.logger.log(`Invited ${email} with role ${role}`);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Failed to invite user');
    }
  }

  async getInvitationList(
    query: GetInvitationReqDto,
    role: AccountRole.HOSPITAL | AccountRole.STAFF,
  ): Promise<PaginatedResourceResponse<Invitation[]>> {
    const client =
      role !== AccountRole.HOSPITAL ? this.clerkAdminClient : this.clerkClient;

    return await client.invitations.getInvitationList({
      limit: query.limit,
      offset: query.offset,
      status: query.status,
    });
  }
}
