import { BaseEntity, Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v7 } from 'uuid';

@Entity({ abstract: true })
export abstract class AppBaseEntity extends BaseEntity {
  @PrimaryKey()
  id = v7();

  @Property({ default: new Date().toISOString() })
  createdAt = new Date();

  @Property({
    onUpdate: () => new Date(),
    nullable: true,
    default: new Date().toISOString(),
  })
  updatedAt = new Date();
}
