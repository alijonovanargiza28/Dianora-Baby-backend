import ProductSchema from '../../schemas/Product.model';
import BoardArticleSchema from '../../schemas/BoardArticle.model';
import { Module } from '@nestjs/common';
import { CommentResolver } from './comment.resolver';
import { CommentService } from './comment.service';
import { MongooseModule } from '@nestjs/mongoose';
import CommentSchema from '../../schemas/Comment.model';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';
import { MemberModule } from '../member/member.module';
import { ProductModule } from '../product/product.module';
import { BoardArticleModule } from '../board-article/board-article.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Product',
				schema: ProductSchema,
			},
			{ name: 'BoardArticle', schema: BoardArticleSchema },
			{
				name: 'Comment',
				schema: CommentSchema,
			},
		]),
		AuthModule,
		MemberModule,
		ProductModule,
		BoardArticleModule,
	],
	providers: [CommentResolver, CommentService],
})
export class CommentModule {}
