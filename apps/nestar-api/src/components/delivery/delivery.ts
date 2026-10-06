import { Field, Float, Int, ObjectType, InputType } from '@nestjs/graphql';
import {
	IsOptional,
	IsString,
	IsNotEmpty,
	IsInt,
	IsNumber,
	Min,
	Max,
	MaxLength,
	ArrayMinSize,
	ArrayMaxSize,
	ValidateNested,
	IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TotalCounter } from '../../libs/dto/member/member';
import { OrderStatus } from '../../libs/enums/marketplace.enum';
import { AddressSnapshot } from '../address/address';
@ObjectType()
export class Delivery {
	@Field(() => String) _id!: string;
	@Field(() => String) orderId!: string;
	@Field(() => OrderStatus) status!: OrderStatus;
	@Field(() => AddressSnapshot) shippingAddress!: AddressSnapshot;
	@Field(() => String, { nullable: true }) trackingCode?: string;
	@Field(() => Date, { nullable: true }) shippedAt?: Date;
	@Field(() => Date, { nullable: true }) deliveredAt?: Date;
	@Field(() => Date) createdAt!: Date;
}
@ObjectType()
export class Deliveries {
	@Field(() => [Delivery]) list!: Delivery[];
	@Field(() => [TotalCounter]) metaCounter!: TotalCounter[];
}
