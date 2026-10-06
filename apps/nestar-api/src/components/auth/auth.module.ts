import { MongooseModule } from '@nestjs/mongoose';
import MemberSchema from '../../schemas/Member.model';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';

@Module({
	imports: [
		HttpModule, //Bu NestJS'ga HTTP requestlar yuborish imkonini beradi.
		MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema }]),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => {
				const secret = config.get<string>('SECRET_TOKEN');
				if (!secret) throw new Error('SECRET_TOKEN is required');
				return { secret, signOptions: { expiresIn: '30d' } };
			},
		}),
	],
	providers: [AuthService],
	exports: [AuthService],
})
export class AuthModule {}
