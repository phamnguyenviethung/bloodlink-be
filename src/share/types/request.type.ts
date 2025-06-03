import { Customer } from '@/database/entities/account.entity';
import { Hospital } from '@/database/entities/account.entity';
import { Admin, Staff } from '@/database/entities/account.entity';
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: Customer | Hospital | Staff | Admin;
}
