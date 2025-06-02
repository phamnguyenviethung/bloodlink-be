import { Customer } from '@/database/entities/Account.entity';
import { Hospital } from '@/database/entities/Account.entity';
import { Admin, Staff } from '@/database/entities/Account.entity';
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: Customer | Hospital | Staff | Admin;
}
