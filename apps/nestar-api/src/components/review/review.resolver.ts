import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import { Review, Reviews, ReviewInput } from './review';
import { ReviewService } from './review.service';
import { ReviewGroup } from '../../libs/enums/marketplace.enum';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { PageInquiry } from '../../libs/marketplace';
import { shapeIntoMongoObjectId } from '../../libs/config';
@Resolver()
export class ReviewResolver {
	constructor(private readonly service: ReviewService) {}
	@UseGuards(AuthGuard) @Mutation(() => Review) createReview(
		@Args('input') input: ReviewInput,
		@AuthMember('_id') memberId: Types.ObjectId,
	) {
		return this.service.create(memberId, input);
	}
	@Query(() => Reviews) getReviews(
		@Args('group', { type: () => ReviewGroup }) group: ReviewGroup,
		@Args('targetId') id: string,
		@Args('input') input: PageInquiry,
	) {
		return this.service.list(group, shapeIntoMongoObjectId(id), input);
	}
	@Roles(MemberType.ADMIN) @UseGuards(RolesGuard) @Mutation(() => Review) removeReviewByAdmin(
		@Args('reviewId') id: string,
	) {
		return this.service.remove(shapeIntoMongoObjectId(id));
	}
	@Roles(MemberType.ADMIN) @UseGuards(RolesGuard) @Query(() => Reviews) getReviewsByAdmin(
		@Args('group', { type: () => ReviewGroup }) group: ReviewGroup,
		@Args('targetId') id: string,
		@Args('input') input: PageInquiry,
	) {
		return this.service.list(group, shapeIntoMongoObjectId(id), input, true);
	}
}
