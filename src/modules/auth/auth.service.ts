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
import { ClerkWebhookPayload } from '../account/interfaces';
import { IAuthService } from './interfaces';
import { ClerkClientType } from '@/share/providers/clerk.provider';
import { GetInvitationReqDto } from './dtos';
import { PaginatedResourceResponse } from '@clerk/backend/dist/api/resources/Deserializer';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly CLERK_ENDPOINT = `https://api.clerk.com/v1`;
  constructor(
    private readonly em: EntityManager,
    @Inject(ClerkClientType.CLIENT)
    private readonly clerkClient: ClerkClient,
    @Inject(ClerkClientType.ADMIN)
    private readonly clerkAdminClient: ClerkClient,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  @Transactional()
  async syncAdminFromClerkWebhook(data: ClerkWebhookPayload): Promise<void> {
    this.logger.log(
      `Syncing admin ${data.data.email_addresses[0].email_address}`,
    );
    const role = data.data.public_metadata.role || AccountRole.STAFF;

    await this.clerkAdminClient.users.updateUserMetadata(data.data.id, {
      publicMetadata: { role },
    });

    const account = await this.em.upsert(Account, {
      id: data.data.id,

      email: data.data.email_addresses[0].email_address,
      role,
    });

    const entity = role === AccountRole.ADMIN ? Admin : Staff;

    await this.em.upsert(entity, {
      id: data.data.id,
      account,
      firstName: data.data.first_name,
      lastName: data.data.last_name,
    });

    this.logger.log(
      `Admin ${data.data.email_addresses[0].email_address} synced`,
    );
  }

  @Transactional()
  async synCustomerFromClerkWebhook(data: ClerkWebhookPayload): Promise<void> {
    const role = data.data.public_metadata.role || AccountRole.USER;

    this.logger.log(
      `Syncing ${role} ${data.data.email_addresses[0].email_address}`,
    );

    await this.clerkClient.users.updateUserMetadata(data.data.id, {
      publicMetadata: { role },
    });

    const account = await this.em.upsert(Account, {
      id: data.data.id,
      email: data.data.email_addresses[0].email_address,
      role,
    });

    if (role === AccountRole.USER) {
      await this.em.upsert(Customer, {
        id: data.data.id,
        account,
        firstName: data.data.first_name,
        lastName: data.data.last_name,
      });
    } else {
      await this.em.upsert(Hospital, {
        id: data.data.id,
        account,
        name: data.data.first_name + ' ' + data.data.last_name,
      });
    }

    this.logger.log(
      `${role} ${data.data.email_addresses[0].email_address} synced`,
    );
  }

  async inviteHospitalAndStaff(
    email: string,
    role: AccountRole,
  ): Promise<void> {
    const isExist = await this.em.findOne(Account, {
      email,
    });

    if (isExist) {
      throw new BadRequestException('User already exists');
    }
    try {
      if (role === AccountRole.HOSPITAL) {
        await this.clerkClient.invitations.createInvitation({
          emailAddress: email,
          publicMetadata: { role },
        });
      } else {
        await this.clerkAdminClient.invitations.createInvitation({
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

  async createTestToken(email: string) {
    const account = await this.em.findOne(Account, {
      email,
    });

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    const isClient = [AccountRole.HOSPITAL, AccountRole.USER].includes(
      account.role,
    );

    const sk = isClient
      ? this.configService.get('CLERK_SECRET_KEY')
      : this.configService.get('CLERK_ADMIN_SECRET_KEY');

    const response = await this.httpService.axiosRef.post(
      `${this.CLERK_ENDPOINT}/sessions`,
      {
        user_id: account.id,
        expires_in_seconds: 2592000,
      },
      {
        headers: {
          Authorization: `Bearer ${sk}`,
        },
      },
    );

    const sid = response.data.id;

    const tokenRes = await this.httpService.axiosRef.post(
      `${this.CLERK_ENDPOINT}/sessions/${sid}/tokens/default`,
      {},
      {
        headers: {
          Authorization: `Bearer ${sk}`,
        },
      },
    );

    return tokenRes.data.jwt;
  }
}
