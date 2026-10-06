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
import { ContentStatus } from '../../libs/enums/marketplace.enum';
import { PageInquiry } from '../../libs/marketplace';
@InputType()
export class BrandInput {
	@IsString() @IsNotEmpty() @MaxLength(150) @Field(() => String) brandName!: string;
	@IsOptional() @IsString() @Field(() => String, { nullable: true }) brandImage?: string;
	@IsOptional() @IsString() @Field(() => String, { nullable: true }) brandDescription?: string;
	@IsOptional() @Field(() => ContentStatus, { nullable: true }) brandStatus?: ContentStatus;
}
@ObjectType()
export class Brand {
	@Field(() => String) _id!: string;
	@Field(() => String) brandName!: string;
	@Field(() => String, { nullable: true }) brandImage?: string;
	@Field(() => String, { nullable: true }) brandDescription?: string;
	@Field(() => ContentStatus) brandStatus!: ContentStatus;
	@Field(() => Date) createdAt!: Date;
	@Field(() => Date) updatedAt!: Date;
}
@ObjectType()
export class Brands {
	@Field(() => [Brand]) list!: Brand[];
	@Field(() => [TotalCounter]) metaCounter!: TotalCounter[];
}
