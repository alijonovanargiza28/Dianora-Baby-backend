import { Module } from '@nestjs/common';
import { NestarBatchController } from './nestar-batch.controller';
import { NestarBatchService } from './nestar-batch.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import ProductSchema from 'apps/nestar-api/src/schemas/Product.model';
import MemberSchema from 'apps/nestar-api/src/schemas/Member.model';

@Module({
	imports: [
		ConfigModule.forRoot(),
		DatabaseModule,
		ScheduleModule.forRoot(),
		MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
		MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema }]),
	],
	controllers: [NestarBatchController],
	providers: [NestarBatchService],
})
export class NestarBatchModule {}
