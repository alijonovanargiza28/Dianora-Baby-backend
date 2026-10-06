import { Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Field, InputType, Int } from '@nestjs/graphql';

import { IsIn, IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';

import { PropertyLocation, PropertyStatus, PropertyType } from '../../enums/property.enum';

import mongoose from 'mongoose';

import { Direction } from '../../enums/common.enum';

import { availableOptions, availablePropertySorts } from '../../config';

/** ======================= PropertyInput ======================= **/

@InputType()
export class PropertyInput {
	@IsNotEmpty()
	@Field(() => PropertyType)
	propertyType!: PropertyType;

	@IsNotEmpty()
	@Field(() => PropertyLocation)
	propertyLocation!: PropertyLocation;

	@IsNotEmpty()
	@Length(3, 100)
	@Field(() => String)
	propertyAddress!: string;

	@IsNotEmpty()
	@Length(3, 100)
	@Field(() => String)
	propertyTitle!: string;

	@IsNotEmpty()
	@Field(() => Number)
	propertyPrice!: number;

	@IsNotEmpty()
	@Field(() => Number)
	propertySquare!: number;

	@IsNotEmpty()
	@IsInt()
	@Min(1)
	@Field(() => Int)
	propertyBeds!: number;

	@IsNotEmpty()
	@IsInt()
	@Min(1)
	@Field(() => Int)
	propertyRooms!: number;

	@IsNotEmpty()
	@Field(() => [String])
	propertyImages!: string[];

	@IsOptional()
	@Length(5, 500)
	@Field(() => String, {
		nullable: true,
	})
	propertyDesc?: string;

	@IsOptional()
	@Field(() => Boolean, {
		nullable: true,
	})
	propertyBarter?: boolean;

	@IsOptional()
	@Field(() => Boolean, {
		nullable: true,
	})
	propertyRent?: boolean;

	// GraphQL field emas
	memberId?: mongoose.Types.ObjectId;

	@IsOptional()
	@Field(() => Date, {
		nullable: true,
	})
	constructedAt?: Date;
}

/** ======================= PricesRange ======================= **/

@InputType()
export class PricesRange {
	@Field(() => Int)
	start!: number;

	@Field(() => Int)
	end!: number;
}

/** ======================= SquaresRange ======================= **/

@InputType()
export class SquaresRange {
	@Field(() => Int)
	start!: number;

	@Field(() => Int)
	end!: number;
}

/** ======================= PeriodsRange ======================= **/

@InputType()
export class PeriodsRange {
	@Field(() => Date)
	start!: Date;

	@Field(() => Date)
	end!: Date;
}

/** ======================= PiSearch ======================= **/

@InputType()
class PiSearch {
	@IsOptional()
	@Field(() => String, {
		nullable: true,
	})
	memberId?: string;

	@IsOptional()
	@Field(() => [PropertyLocation], {
		nullable: true,
	})
	locationList?: PropertyLocation[];

	@IsOptional()
	@Field(() => [PropertyType], {
		nullable: true,
	})
	typeList?: PropertyType[];

	@IsOptional()
	@Field(() => [Int], {
		nullable: true,
	})
	roomList?: number[];

	@IsOptional()
	@Field(() => [Int], {
		nullable: true,
	})
	bedsList?: number[];

	@IsOptional()
	@IsIn(availableOptions, {
		each: true,
	})
	@Field(() => [String], {
		nullable: true,
	})
	options?: string[];

	@IsOptional()
	@Field(() => PricesRange, {
		nullable: true,
	})
	pricesRange?: PricesRange;

	@IsOptional()
	@Field(() => PeriodsRange, {
		nullable: true,
	})
	periodsRange?: PeriodsRange;

	@IsOptional()
	@Field(() => SquaresRange, {
		nullable: true,
	})
	squaresRange?: SquaresRange;

	@IsOptional()
	@Field(() => String, {
		nullable: true,
	})
	text?: string;
}

/** ======================= PropertiesInquiry ======================= **/

@InputType()
export class PropertiesInquiry {
	@IsNotEmpty()
	@Min(1)
	@IsInt()
	@Field(() => Int)
	page!: number;

	@IsNotEmpty()
	@Min(1)
	@IsInt()
	@Max(100)
	@Field(() => Int)
	limit!: number;

	@IsOptional()
	@IsIn(availablePropertySorts)
	@Field(() => String, {
		nullable: true,
	})
	sort?: string;

	@IsOptional()
	@Field(() => Direction, {
		nullable: true,
	})
	direction?: Direction;

	@IsNotEmpty()
	@ValidateNested()
	@Type(() => PiSearch)
	@Field(() => PiSearch)
	search!: PiSearch;
}

/** ======================= APISearch ======================= **/

@InputType()
class APISearch {
	@IsOptional()
	@Field(() => PropertyStatus, {
		nullable: true,
	})
	propertyStatus?: PropertyStatus;
}

/** ======================= AgentPropertiesInquiry ======================= **/

@InputType()
export class AgentPropertiesInquiry {
	@IsNotEmpty()
	@Min(1)
	@IsInt()
	@Field(() => Int)
	page!: number;

	@IsNotEmpty()
	@Min(1)
	@IsInt()
	@Max(100)
	@Field(() => Int)
	limit!: number;

	@IsOptional()
	@IsIn(availablePropertySorts)
	@Field(() => String, {
		nullable: true,
	})
	sort?: string;

	@IsOptional()
	@Field(() => Direction, {
		nullable: true,
	})
	direction?: Direction;

	@IsNotEmpty()
	@ValidateNested()
	@Type(() => APISearch)
	@Field(() => APISearch)
	search!: APISearch;
}

/** ======================= ALPISearch ======================= **/

@InputType()
class ALPISearch {
	@IsOptional()
	@Field(() => PropertyStatus, {
		nullable: true,
	})
	propertyStatus?: PropertyStatus;

	@IsOptional()
	@Field(() => [PropertyLocation], {
		nullable: true,
	})
	propertyLocationList?: PropertyLocation[];
}

/** ======================= AllPropertiesInquiry ======================= **/

@InputType()
export class AllPropertiesInquiry {
	@IsNotEmpty()
	@Min(1)
	@IsInt()
	@Field(() => Int)
	page!: number;

	@IsNotEmpty()
	@Min(1)
	@IsInt()
	@Max(100)
	@Field(() => Int)
	limit!: number;

	@IsOptional()
	@IsIn(availablePropertySorts)
	@Field(() => String, {
		nullable: true,
	})
	sort?: string;

	@IsOptional()
	@Field(() => Direction, {
		nullable: true,
	})
	direction?: Direction;

	@IsNotEmpty()
	@ValidateNested()
	@Type(() => ALPISearch)
	@Field(() => ALPISearch)
	search!: ALPISearch;
}

@InputType()
export class OrdinaryInquiry {
	@IsNotEmpty()
	@Min(1)
	@IsInt()
	@Field(() => Int)
	page!: number;

	@IsNotEmpty()
	@Min(1)
	@IsInt()
	@Max(100)
	@Field(() => Int)
	limit!: number;
}
