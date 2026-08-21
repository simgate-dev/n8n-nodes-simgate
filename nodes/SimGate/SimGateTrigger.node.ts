import { createHmac, timingSafeEqual } from 'node:crypto';
import {
	NodeApiError,
	NodeConnectionTypes,
	NodeOperationError,
	type IDataObject,
	type JsonObject,
	type IHookFunctions,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookFunctions,
	type IWebhookResponseData,
} from 'n8n-workflow';

/** Reject events whose signed timestamp is further than this from now, to stop replays. */
const TIMESTAMP_TOLERANCE_SECONDS = 300;

type SimGateEvent = IDataObject & { type?: string };

export class SimGateTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SimGate Trigger',
		name: 'simGateTrigger',
		icon: { light: 'file:../../icons/simgate.svg', dark: 'file:../../icons/simgate.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].join(", ")}}',
		description: 'Starts a workflow when your phone receives an SMS',
		defaults: {
			name: 'SimGate Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'simGateApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				options: [
					{
						name: 'SMS Received',
						value: 'sms.received',
						description: 'The phone received a text message',
					},
				],
				default: ['sms.received'],
				required: true,
				description: 'Which SimGate events should start this workflow',
			},
		],
	};

	webhookMethods = {
		default: {
			// SimGate keeps one webhook destination per account, so "does it exist" means
			// "is the account currently pointed at this workflow's URL".
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const credentials = await this.getCredentials('simGateApi');
				const webhookUrl = this.getNodeWebhookUrl('default') as string;

				const response = (await this.helpers.httpRequestWithAuthentication.call(
					this,
					'simGateApi',
					{
						method: 'GET',
						url: `${credentials.baseUrl as string}/v1/webhooks/integration`,
						qs: { url: webhookUrl },
						json: true,
					},
				)) as { matches?: boolean };

				return response.matches === true;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const credentials = await this.getCredentials('simGateApi');
				const webhookUrl = this.getNodeWebhookUrl('default') as string;

				let response: { url?: string; signingSecret?: string };
				try {
					response = (await this.helpers.httpRequestWithAuthentication.call(
						this,
						'simGateApi',
						{
							method: 'POST',
							url: `${credentials.baseUrl as string}/v1/webhooks/integration`,
							body: { url: webhookUrl },
							json: true,
						},
					)) as { url?: string; signingSecret?: string };
				} catch (error) {
					// 409 means the account already delivers to a different endpoint. Say so
					// plainly rather than silently taking the slot over.
					const status = (error as { httpCode?: string; statusCode?: number }).statusCode;
					const httpCode = (error as { httpCode?: string }).httpCode;
					if (status === 409 || httpCode === '409') {
						throw new NodeOperationError(
							this.getNode(),
							'This SimGate account already sends webhooks somewhere else. Turn that webhook off in the SimGate dashboard, then activate this workflow again.',
						);
					}
					throw new NodeApiError(this.getNode(), error as JsonObject);
				}

				// Keep the signing secret with the workflow so deliveries verify without the
				// user copying anything by hand.
				const webhookData = this.getWorkflowStaticData('node');
				webhookData.signingSecret = response.signingSecret;
				webhookData.webhookUrl = response.url ?? webhookUrl;

				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const credentials = await this.getCredentials('simGateApi');
				const webhookData = this.getWorkflowStaticData('node');
				const webhookUrl =
					(webhookData.webhookUrl as string | undefined) ??
					(this.getNodeWebhookUrl('default') as string);

				try {
					await this.helpers.httpRequestWithAuthentication.call(this, 'simGateApi', {
						method: 'DELETE',
						url: `${credentials.baseUrl as string}/v1/webhooks/integration`,
						body: { url: webhookUrl },
						json: true,
					});
				} catch (error) {
					// Deactivation must not fail because the remote slot was already cleared,
					// but the reason still belongs in the log.
					this.logger.warn(
						`SimGate Trigger could not release the webhook for ${webhookUrl}: ${
							(error as Error).message
						}`,
					);
					return false;
				}

				delete webhookData.signingSecret;
				delete webhookData.webhookUrl;

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const request = this.getRequestObject();
		const headers = this.getHeaderData() as Record<string, string | undefined>;
		const credentials = await this.getCredentials('simGateApi');
		const events = this.getNodeParameter('events', []) as string[];

		// The signature covers the exact bytes SimGate sent, so re-serialising the parsed
		// JSON would not match. n8n's body parser usually fills rawBody already; read it
		// explicitly when it has not.
		if (!request.rawBody) {
			await request.readRawBody();
		}
		if (!request.rawBody) {
			throw new NodeOperationError(
				this.getNode(),
				"Could not read the request body, so the SimGate signature cannot be checked. Make sure nothing between SimGate and n8n rewrites the request, such as a proxy that re-encodes JSON.",
			);
		}
		const body = request.rawBody.toString('utf8');

		const webhookData = this.getWorkflowStaticData('node');
		const signingSecret =
			(webhookData.signingSecret as string | undefined) ??
			(credentials.signingSecret as string | undefined) ??
			'';
		if (signingSecret !== '') {
			const timestamp = headers['x-simgate-timestamp'] ?? '';
			const signature = headers['x-simgate-signature'] ?? '';

			const expected = `v1=${createHmac('sha256', signingSecret)
				.update(`${timestamp}.${body}`, 'utf8')
				.digest('hex')}`;

			const expectedBuffer = Buffer.from(expected, 'utf8');
			const receivedBuffer = Buffer.from(signature, 'utf8');
			if (
				expectedBuffer.length !== receivedBuffer.length ||
				!timingSafeEqual(expectedBuffer, receivedBuffer)
			) {
				throw new NodeOperationError(
					this.getNode(),
					"The signature on this request does not match the signing secret. Copy the current secret from Webhooks in the SimGate dashboard into 'Webhook Signing Secret' on your SimGate API credential, or leave that field empty to let the trigger fetch it when it registers.",
				);
			}

			const age = Math.abs(Date.now() / 1000 - Number(timestamp));
			if (!Number.isFinite(age) || age > TIMESTAMP_TOLERANCE_SECONDS) {
				throw new NodeOperationError(
					this.getNode(),
					'This request was signed more than five minutes ago, so it was turned away in case it was replayed. Check that the clock on this n8n host is accurate, then ask SimGate to resend.',
				);
			}
		}

		let event: SimGateEvent;
		try {
			event = JSON.parse(body) as SimGateEvent;
		} catch {
			throw new NodeOperationError(
				this.getNode(),
				'The request body was not valid JSON. Confirm the SimGate dashboard points at this workflow URL and that no proxy in front of n8n is altering the body.',
			);
		}

		// Acknowledge events the user did not subscribe to without starting a workflow run.
		if (event.type === undefined || !events.includes(event.type)) {
			return { webhookResponse: { received: true, ignored: true } };
		}

		return {
			workflowData: [this.helpers.returnJsonArray([event])],
		};
	}
}
