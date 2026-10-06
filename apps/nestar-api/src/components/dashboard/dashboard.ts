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
import { Product } from '../product/product';
import { Member } from '../../libs/dto/member/member';
import { Order } from '../order/order';
@ObjectType()
export class AdminDashboard {
	@Field(() => Int) totalUsers!: number;
	@Field(() => Int) totalSellers!: number;
	@Field(() => Int) activeSellers!: number;
	@Field(() => Int) blockedSellers!: number;
	@Field(() => Int) totalProducts!: number;
	@Field(() => Int) activeProducts!: number;
	@Field(() => Int) totalOrders!: number;
	@Field(() => Int) deliveredOrders!: number;
	@Field(() => Int) pendingOrders!: number;
	@Field(() => Float) revenue!: number;
	@Field(() => [Product]) topProducts!: Product[];
	@Field(() => [Member]) topSellers!: Member[];
	@Field(() => [Order]) recentOrders!: Order[];
}
@ObjectType()
export class SellerDashboard {
	@Field(() => Int) productCount!: number;
	@Field(() => Int) salesCount!: number;
	@Field(() => Int) deliveredCount!: number;
	@Field(() => Int) followers!: number;
	@Field(() => Int) reviewCount!: number;
	@Field(() => Float) averageRating!: number;
	@Field(() => Float) revenue!: number;
}
