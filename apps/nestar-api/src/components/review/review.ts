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
import { ReviewGroup, ContentStatus } from '../../libs/enums/marketplace.enum';
import { PageInquiry } from '../../libs/marketplace';
@InputType()
export class ReviewInput {
	@Field(() => ReviewGroup) group!: ReviewGroup;
	@IsMongoId() @Field(() => String) targetId!: string;
	@IsMongoId() @Field(() => String) orderId!: string;
	@IsInt() @Min(1) @Max(5) @Field(() => Int) rating!: number;
	@IsString() @IsNotEmpty() @MaxLength(3000) @Field(() => String) text!: string;
}
@ObjectType()
export class Review {
	@Field(() => String) _id!: string;
	@Field(() => ReviewGroup) group!: ReviewGroup;
	@Field(() => String) targetId!: string;
	@Field(() => String) orderId!: string;
	@Field(() => String) authorId!: string;
	@Field(() => Int) rating!: number;
	@Field(() => String) text!: string;
	@Field(() => ContentStatus) status!: ContentStatus;
	@Field(() => Date) createdAt!: Date;
}
@ObjectType()
export class Reviews {
	@Field(() => [Review]) list!: Review[];
	@Field(() => [TotalCounter]) metaCounter!: TotalCounter[];
}
