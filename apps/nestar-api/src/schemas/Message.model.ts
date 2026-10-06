import { Schema } from 'mongoose';
const MessageSchema = new Schema(
	{
		senderId: { type: Schema.Types.ObjectId, required: true },
		receiverId: { type: Schema.Types.ObjectId, required: true },
		productId: Schema.Types.ObjectId,
		text: { type: String, required: true, maxlength: 3000 },
		isRead: { type: Boolean, default: false },
	},
	{ timestamps: true, collection: 'messages' },
);
MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
MessageSchema.index({ receiverId: 1, isRead: 1, createdAt: -1 });
export default MessageSchema;
