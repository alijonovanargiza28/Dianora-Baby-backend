import { Message } from '../../libs/enums/common.enum';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, Connection, ClientSession } from 'mongoose';
import { Review, ReviewInput } from './review';
import { Order } from '../order/order';
import { Product } from '../product/product';
import { Member } from '../../libs/dto/member/member';
import { ReviewGroup, OrderStatus, ContentStatus, PaymentStatus } from '../../libs/enums/marketplace.enum';
import { atomic, PageInquiry, facet } from '../../libs/marketplace';
import { shapeIntoMongoObjectId } from '../../libs/config';
@Injectable()
export class ReviewService {
	constructor(
		@InjectConnection() private readonly connection: Connection,
		@InjectModel('Review') private readonly reviews: Model<Review>,
		@InjectModel('Order') private readonly orders: Model<Order>,
		@InjectModel('Product') private readonly products: Model<Product>,
		@InjectModel('Member') private readonly members: Model<Member>,
	) {}
	async recalculate(group: ReviewGroup, targetId: Types.ObjectId, session: ClientSession) {
		const [stats] = await this.reviews
			.aggregate([
				{ $match: { group, targetId, status: ContentStatus.ACTIVE } },
				{ $group: { _id: null, averageRating: { $avg: '$rating' }, count: { $sum: 1 } } },
			])
			.session(session);
		const fields = {
			averageRating: stats?.averageRating ?? 0,
			[group === ReviewGroup.PRODUCT ? 'productReviews' : 'memberReviews']: stats?.count ?? 0,
		};
		if (group === ReviewGroup.PRODUCT) await this.products.updateOne({ _id: targetId }, { $set: fields }, { session });
		else await this.members.updateOne({ _id: targetId }, { $set: fields }, { session });
	}
	async create(authorId: Types.ObjectId, input: ReviewInput) {
		if (![ReviewGroup.PRODUCT, ReviewGroup.SELLER].includes(input.group))
			throw new BadRequestException('INVALID_REVIEW_GROUP');
		if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5)
			throw new BadRequestException('INVALID_RATING');
		try {
			return await atomic(this.connection, async (session) => {
				const order = await this.orders
					.findOne({
						_id: shapeIntoMongoObjectId(input.orderId),
						memberId: authorId,
						status: OrderStatus.DELIVERED,
						paymentStatus: PaymentStatus.PAID,
						items: {
							$elemMatch: {
								[input.group === ReviewGroup.PRODUCT ? 'productId' : 'sellerId']: shapeIntoMongoObjectId(
									input.targetId,
								),
								status: OrderStatus.DELIVERED,
							},
						},
					})
					.session(session);
				if (!order) throw new BadRequestException(Message.PURCHASE_REQUIRED_FOR_REVIEW);
				const [review] = await this.reviews.create([{ ...input, authorId }], { session });
				await this.recalculate(input.group, shapeIntoMongoObjectId(input.targetId), session);
				return review;
			});
		} catch (error) {
			if ((error as { code?: number }).code === 11000) throw new BadRequestException(Message.ALREADY_REVIEWED);
			throw error;
		}
	}
	async list(group: ReviewGroup, targetId: Types.ObjectId, input: PageInquiry, admin = false) {
		return (
			await this.reviews.aggregate([
				{ $match: { group, targetId, ...(!admin ? { status: ContentStatus.ACTIVE } : {}) } },
				{ $sort: { createdAt: input.oldest ? 1 : -1, _id: -1 } },
				facet(input),
			])
		)[0];
	}
	async remove(id: Types.ObjectId) {
		return atomic(this.connection, async (session) => {
			const result = await this.reviews.findByIdAndUpdate(
				id,
				{ $set: { status: ContentStatus.DELETE } },
				{ new: true, session },
			);
			if (!result) throw new NotFoundException('REVIEW_NOT_FOUND');
			await this.recalculate(result.group, shapeIntoMongoObjectId(result.targetId), session);
			return result;
		});
	}
}
