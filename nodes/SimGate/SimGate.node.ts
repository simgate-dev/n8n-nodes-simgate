import {
	NodeConnectionTypes,
	type ILoadOptionsFunctions,
	type INodeListSearchResult,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';
import { accountDescription } from './resources/account';
import { deviceDescription } from './resources/device';
import { messageDescription } from './resources/message';

type SimGateDevice = {
	deviceId: string;
	deviceName?: string;
	connectionStatus?: string;
};

export class SimGate implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SimGate',
		name: 'simGate',
		icon: { light: 'file:../../icons/simgate.svg', dark: 'file:../../icons/simgate.dark.svg' },
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Send SMS from your own phone number with SimGate',
		defaults: {
			name: 'SimGate',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'simGateApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl}}/v1',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Account',
						value: 'account',
					},
					{
						name: 'Device',
						value: 'device',
					},
					{
						name: 'Message',
						value: 'message',
					},
				],
				default: 'message',
			},
			...accountDescription,
			...deviceDescription,
			...messageDescription,
		],
	};

	methods = {
		listSearch: {
			async searchDevices(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const credentials = await this.getCredentials('simGateApi');
				const response = (await this.helpers.httpRequestWithAuthentication.call(
					this,
					'simGateApi',
					{
						method: 'GET',
						url: `${credentials.baseUrl as string}/v1/devices`,
						json: true,
					},
				)) as { devices?: SimGateDevice[] };

				const results = (response.devices ?? []).map((device) => ({
					name: device.deviceName
						? `${device.deviceName} (${device.connectionStatus ?? 'unknown'})`
						: device.deviceId,
					value: device.deviceId,
				}));

				if (filter) {
					const needle = filter.toLowerCase();
					return {
						results: results.filter((r) => r.name.toLowerCase().includes(needle)),
					};
				}

				return { results };
			},
		},
	};
}
