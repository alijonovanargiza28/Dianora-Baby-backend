import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import MessageSchema from '../../schemas/Message.model';
import ProductSchema from '../../schemas/Product.model';
import MemberSchema from '../../schemas/Member.model';
import { MessageService } from './message.service';
import { MessageResolver } from './message.resolver';
@Module({
	imports: [
		AuthModule,
		MongooseModule.forFeature([
			{ name: 'Message', schema: MessageSchema },
			{ name: 'Product', schema: ProductSchema },
			{ name: 'Member', schema: MemberSchema },
		]),
	],
	providers: [MessageService, MessageResolver],
	exports: [MessageService],
})
export class MessageModule {}
