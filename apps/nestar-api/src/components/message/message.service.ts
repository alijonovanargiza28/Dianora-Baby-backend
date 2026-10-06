import { Message } from '../../libs/enums/common.enum';
import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatMessage, MessageInput } from './message';
import { Member } from '../../libs/dto/member/member';
import { MemberType, MemberStatus } from '../../libs/enums/member.enum';
import { Product } from '../product/product';
import { ProductStatus } from '../../libs/enums/product.enum';
import { PageInquiry, facet } from '../../libs/marketplace';
import { NotificationService } from '../notification/notification.service';
import { NotificationType, NotificationGroup } from '../../libs/enums/notification.enum';
@Injectable()
export class MessageService {
	onMessage?: (message: ChatMessage) => Promise<void>;
	constructor(
		@InjectModel('Message') private readonly model: Model<ChatMessage>,
		@InjectModel('Member') private readonly members: Model<Member>,
		@InjectModel('Product') private readonly products: Model<Product>,
		private readonly notifications: NotificationService,
	) {}
	async send(actor: Member, input: MessageInput) {
		if (String(actor._id) === input.receiverId) throw new BadRequestException('SELF_MESSAGE_DENIED');
		const receiver = await this.members.findOne({ _id: input.receiverId, memberStatus: MemberStatus.ACTIVE });
		if (!receiver) throw new NotFoundException('RECEIVER_NOT_FOUND');
		const replying =
			actor.memberType === MemberType.SELLER &&
			(await this.model.exists({ senderId: receiver._id, receiverId: actor._id }));
		if (receiver.memberType !== MemberType.SELLER && !replying) throw new ForbiddenException(Message.FORBIDDEN);
		if (input.productId) {
			const product = await this.products.findOne({
				_id: input.productId,
				productStatus: { $in: [ProductStatus.ACTIVE, ProductStatus.SOLD_OUT] },
			});
			if (!product || ![String(actor._id), String(receiver._id)].includes(String(product.productSellerId)))
				throw new BadRequestException('INVALID_PRODUCT');
		}
		const message = await this.model.create({ ...input, senderId: actor._id });
		await this.notifications.send(
			receiver._id,
			actor._id,
			NotificationType.MESSAGE,
			NotificationGroup.MESSAGE,
			actor._id,
			'New message',
		);
		await this.onMessage?.(message.toObject());
		return message;
	}
	async list(memberId: Types.ObjectId, peer: Types.ObjectId | undefined, input: PageInquiry) {
		const match = peer
			? {
					$or: [
						{ senderId: memberId, receiverId: peer },
						{ senderId: peer, receiverId: memberId },
					],
				}
			: { $or: [{ senderId: memberId }, { receiverId: memberId }] };
		return (
			await this.model.aggregate([
				{ $match: match },
				{ $sort: { createdAt: input.oldest ? 1 : -1, _id: -1 } },
				facet(input),
			])
		)[0];
	}
	async read(memberId: Types.ObjectId, id: Types.ObjectId) {
		const message = await this.model.findOneAndUpdate(
			{ _id: id, receiverId: memberId },
			{ $set: { isRead: true } },
			{ new: true },
		);
		if (!message) throw new NotFoundException('MESSAGE_NOT_FOUND');
		return message;
	}
}
