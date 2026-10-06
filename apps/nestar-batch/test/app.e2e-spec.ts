import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { NestarBatchController } from './../src/nestar-batch.controller';
import { NestarBatchService } from './../src/nestar-batch.service';

describe('NestarBatchController (e2e)', () => {
	let app: INestApplication;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			controllers: [NestarBatchController],
			providers: [
				{ provide: NestarBatchService, useValue: { getHello: () => 'Welcome to DIANORA BABY BATCH Server' } },
			],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	afterEach(async () => {
		await app.close();
	});

	it('/ (GET)', () => {
		return request(app.getHttpServer()).get('/').expect(200).expect('Welcome to DIANORA BABY BATCH Server');
	});
});
