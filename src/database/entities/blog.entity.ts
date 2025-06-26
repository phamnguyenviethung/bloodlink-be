import { Entity, Property, Enum, Index } from '@mikro-orm/core';
import { AppBaseEntity } from './base.entity';

export enum BlogStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity({ tableName: 'blogs' })
@Index({ properties: ['slug'] })
@Index({ properties: ['status'] })
@Index({ properties: ['createdAt'] })
export class Blog extends AppBaseEntity {
  @Property({ length: 255 })
  title!: string;

  @Property({ type: 'text' })
  content!: string;

  @Property({ length: 500, nullable: true })
  excerpt?: string;

  @Property({ length: 500, nullable: true })
  imageUrl?: string;

  @Property({ length: 255, unique: true })
  slug!: string;

  @Property({ type: 'json', nullable: true })
  tags?: string[];

  @Enum(() => BlogStatus)
  @Property({ default: BlogStatus.DRAFT })
  status: BlogStatus = BlogStatus.DRAFT;

  @Property({ nullable: true })
  publishedAt?: Date;

  constructor(data: Partial<Blog> = {}) {
    super();
    Object.assign(this, data);
  }
}

/* Example Blog Data:
{
  title: "Hiến máu nhân đạo - Hành động ý nghĩa vì cộng đồng",
  content: "<h1>Hiến máu nhân đạo</h1><p>Hiến máu là một hành động cao đẹp, thể hiện tinh thần tương thân tương ái của con người Việt Nam. Mỗi đơn vị máu hiến tặng có thể cứu sống nhiều người bệnh đang trong tình trạng nguy kịch.</p><h2>Lợi ích của việc hiến máu</h2><ul><li>Giúp đỡ người bệnh có cơ hội được điều trị</li><li>Tăng cường sức khỏe cho người hiến máu</li><li>Góp phần xây dựng cộng đồng nhân ái</li></ul>",
  excerpt: "Hiến máu nhân đạo là hành động cao đẹp, thể hiện tinh thần tương thân tương ái, mỗi đơn vị máu có thể cứu sống nhiều người bệnh.",
  imageUrl: "https://example.com/images/hien-mau-nhan-dao.jpg",
  slug: "hien-mau-nhan-dao-hanh-dong-y-nghia-vi-cong-dong",
  tags: ["hiến máu", "nhân đạo", "sức khỏe", "cộng đồng"],
  status: BlogStatus.PUBLISHED
}
*/
