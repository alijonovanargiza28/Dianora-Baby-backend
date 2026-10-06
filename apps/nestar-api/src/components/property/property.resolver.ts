import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import mongoose from 'mongoose';
import { PropertyService } from './property.service';
import { Properties, Property } from '../../libs/dto/property/property';
import {
	AgentPropertiesInquiry,
	AllPropertiesInquiry,
	OrdinaryInquiry,
	PropertiesInquiry,
	PropertyInput,
} from '../../libs/dto/property/property.input';
import { LikeService } from '../like/like.service';

import { PropertyUpdate } from '../../libs/dto/property/property.update';

import { Roles } from '../auth/decorators/roles.decorator';
import { AuthMember } from '../auth/decorators/authMember.decorator';

import { MemberType } from '../../libs/enums/member.enum';

import { RolesGuard } from '../auth/guards/roles.guard';
import { WithoutGuard } from '../auth/guards/without.guard';

import { shapeIntoMongoObjectId } from '../../libs/config';
import { AuthGuard } from '../auth/guards/auth.guard';

@Resolver()
export class PropertyResolver {
	constructor(private readonly propertyService: PropertyService) {}

	/**=========================== createProperty =============================**/

	@Roles(MemberType.SELLER)
	@UseGuards(RolesGuard)
	@Mutation(() => Property)
	public async createProperty(
		@Args('input') input: PropertyInput,

		@AuthMember('_id')
		memberId: mongoose.Types.ObjectId,
	): Promise<Property> {
		console.log('Mutation: createProperty');

		input.memberId = memberId;

		return await this.propertyService.createProperty(input);
	}

	/**=========================== getProperty =============================**/

	@UseGuards(WithoutGuard)
	@Query(() => Property)
	public async getProperty(
		@Args('input') propertyId: string,
		@AuthMember('_id') memberId: mongoose.Types.ObjectId,
	): Promise<Property> {
		console.log('Query: getProperty');
		const propertyObjectId = shapeIntoMongoObjectId(propertyId);
		return await this.propertyService.getProperty(memberId, propertyObjectId);
	}

	@UseGuards(AuthGuard)
	@Query(() => Properties)
	public async getFavorites(
		@Args('input') input: OrdinaryInquiry,
		@AuthMember('_id') memberId: mongoose.Types.ObjectId,
	): Promise<Properties> {
		console.log('Query: getFavorites');

		return await this.propertyService.getFavorite(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Query(() => Properties)
	public async getVisited(
		@Args('input') input: OrdinaryInquiry,
		@AuthMember('_id') memberId: mongoose.Types.ObjectId,
	): Promise<Properties> {
		console.log('Query: getVisited');

		return await this.propertyService.getFavorite(memberId, input);
	}
	/**=========================== updateProperty =============================**/

	@Roles(MemberType.SELLER)
	@UseGuards(RolesGuard)
	@Mutation(() => Property)
	public async updateProperty(
		@Args('input') input: PropertyUpdate,

		@AuthMember('_id')
		memberId: mongoose.Types.ObjectId,
	): Promise<Property> {
		console.log('Mutation: updateProperty');

		return await this.propertyService.updateProperty(memberId, input);
	}

	/**=========================== getProperties =============================**/

	@UseGuards(WithoutGuard)
	@Query(() => Properties)
	public async getProperties(
		@Args('input') input: PropertiesInquiry,

		@AuthMember('_id')
		memberId: mongoose.Types.ObjectId,
	): Promise<Properties> {
		console.log('Query: getProperties');

		return await this.propertyService.getProperties(memberId, input);
	}

	/**=========================== getAgentProperties =============================**/

	@Roles(MemberType.SELLER)
	@UseGuards(RolesGuard)
	@Query(() => Properties)
	public async getAgentProperties(
		@Args('input') input: AgentPropertiesInquiry,

		@AuthMember('_id')
		memberId: mongoose.Types.ObjectId,
	): Promise<Properties> {
		console.log('Query: getAgentProperties');

		return await this.propertyService.getAgentProperties(memberId, input);
	}

	/**=========================== likeTargetProperty =============================**/

	@UseGuards(AuthGuard)
	@Mutation(() => Property)
	public async likeTargetProperty(
		@Args('propertyId') input: string,

		@AuthMember('_id')
		memberId: mongoose.Types.ObjectId,
	): Promise<Property> {
		console.log('Mutation: LikeTargetProperty');

		const likeRefId = shapeIntoMongoObjectId(input);

		return await this.propertyService.likeTargetProperty(memberId, likeRefId);
	}

	/**=========================== ADMIN =============================**/

	/**=========================== getAllPropertiesByAdmin =============================**/

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => Properties)
	public async getAllPropertiesByAdmin(@Args('input') input: AllPropertiesInquiry): Promise<Properties> {
		console.log('Query: getAllPropertiesByAdmin');

		return await this.propertyService.getAllPropertiesByAdmin(input);
	}

	/**=========================== updatePropertyByAdmin =============================**/

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Property)
	public async updatePropertyByAdmin(@Args('input') input: PropertyUpdate): Promise<Property> {
		console.log('Mutation: updatePropertyByAdmin');

		return await this.propertyService.updatePropertyByAdmin(input);
	}

	/**=========================== removePropertyByAdmin =============================**/

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Property)
	public async removePropertyByAdmin(@Args('propertyId') propertyId: string): Promise<Property> {
		console.log('Mutation: removePropertyByAdmin');

		const propertyObjectId = shapeIntoMongoObjectId(propertyId);

		return await this.propertyService.removePropertyByAdmin(propertyObjectId);
	}
}
