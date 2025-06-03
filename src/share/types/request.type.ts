import {
  Admin,
  Staff,
  Hospital,
  Customer,
} from '@/database/entities/Account.entity';
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: Customer | Hospital | Staff | Admin | null;
}
