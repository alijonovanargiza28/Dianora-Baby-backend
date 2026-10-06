import { Logger, OnModuleDestroy } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { AuthService } from '../components/auth/auth.service';
import { MessageService } from '../components/message/message.service';
import { MessageInput } from '../components/message/message';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
@WebSocketGateway({ transports: ['websocket'], secure: false })
export class SocketGateway implements OnGatewayInit, OnModuleDestroy {
	private readonly logger = new Logger('SocketEventsGateway');
	private summaryClient = 0;
	@WebSocketServer() server!: Server;
	private readonly authenticated = new Map<WebSocket, { memberId: string; token: string }>();
	constructor(
		private readonly auth: AuthService,
		private readonly messages: MessageService,
	) {}
	afterInit() {
		this.logger.log('WebSocket server initialized');
		this.messages.onMessage = async (message) => {
			for (const [client, session] of this.authenticated) {
				if (![String(message.senderId), String(message.receiverId)].includes(session.memberId)) continue;
				try {
					await this.auth.verifyToken(session.token);
					if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify({ event: 'newMessage', data: message }));
				} catch {
					this.authenticated.delete(client);
				}
			}
		};
	}
	handleConnection() {
		this.summaryClient++;
	}
	handleDisconnect(client: WebSocket) {
		this.summaryClient--;
		this.authenticated.delete(client);
	}
	@SubscribeMessage('message') handleMessage(): string {
		return 'Hello world!';
	}
	@SubscribeMessage('authenticate') async authenticate(client: WebSocket, payload: { token: string }) {
		try {
			if (typeof payload?.token !== 'string') return { error: 'UNAUTHORIZED' };
			const member = await this.auth.verifyToken(payload.token);
			this.authenticated.set(client, { memberId: String(member._id), token: payload.token });
			return { event: 'authenticated', data: true };
		} catch {
			return { error: 'UNAUTHORIZED' };
		}
	}
	@SubscribeMessage('sendMessage') async sendMessage(client: WebSocket, payload: MessageInput) {
		try {
			const identity = this.authenticated.get(client);
			if (!identity) return { error: 'UNAUTHORIZED' };
			const actor = await this.auth.verifyToken(identity.token);
			const input = plainToInstance(MessageInput, payload);
			await validateOrReject(input, { whitelist: true, forbidNonWhitelisted: true });
			return { event: 'messageSent', data: await this.messages.send(actor, input) };
		} catch {
			return { error: 'MESSAGE_REJECTED' };
		}
	}
	onModuleDestroy() {
		this.authenticated.clear();
		this.messages.onMessage = undefined;
	}
}
