import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SimGateApi implements ICredentialType {
	name = 'simGateApi';

	displayName = 'SimGate API';

	icon: Icon = { light: 'file:../icons/simgate.svg', dark: 'file:../icons/simgate.dark.svg' };

	documentationUrl = 'https://github.com/simgate-dev/n8n-nodes-simgate?tab=readme-ov-file#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description: 'Create one in the SimGate dashboard under API',
		},
		{
			displayName: 'Webhook Signing Secret',
			name: 'signingSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'Leave empty. The SimGate Trigger captures this automatically when it registers its webhook. Set it only when the webhook was configured by hand in the SimGate dashboard.',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.simgate.app',
			description: 'Change this only if you run a self-hosted SimGate backend',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-api-key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/v1/usage',
		},
	};
}
