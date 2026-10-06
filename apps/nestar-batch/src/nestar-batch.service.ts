import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Member } from 'apps/nestar-api/src/libs/dto/member/member';
import { Product } from 'apps/nestar-api/src/components/product/product';
@Injectable()
export class NestarBatchService {
	constructor(
		@InjectModel('Product') private readonly products: Model<Product>,
		@InjectModel('Member') private readonly members: Model<Member>,
	) {}
	async batchRollback(): Promise<void> {
		await this.products.updateMany({ productStatus: { $in: ['ACTIVE', 'SOLD_OUT'] } }, { $set: { productRank: 0 } });
		await this.members.updateMany({ memberType: 'SELLER', memberStatus: 'ACTIVE' }, { $set: { memberRank: 0 } });
	}
	async batchTopProducts(): Promise<void> {
		await this.products.updateMany({ productStatus: { $in: ['ACTIVE', 'SOLD_OUT'] } }, [
			{
				$set: {
					productRank: {
						$add: ['$productViews', { $multiply: ['$productFavorites', 2] }, { $multiply: ['$productSales', 5] }],
					},
				},
			},
		]);
	}
	async batchTopSellers(): Promise<void> {
		await this.members.updateMany({ memberType: 'SELLER', memberStatus: 'ACTIVE' }, [
			{
				$set: {
					memberRank: {
						$add: [
							'$memberViews',
							{ $multiply: ['$memberProducts', 5] },
							{ $multiply: ['$memberArticles', 3] },
							{ $multiply: ['$memberLikes', 2] },
							{ $multiply: ['$memberFollowers', 2] },
							{ $multiply: ['$memberSales', 5] },
						],
					},
				},
			},
		]);
	}
	getHello(): string {
		return 'Welcome to DIANORA BABY BATCH Server';
	}
}
