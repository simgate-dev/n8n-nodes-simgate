import {
	NodeConnectionTypes,
	type ILoadOptionsFunctions,
	type INodePropertyOptions,
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
		loadOptions: {
			async getDevices(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
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

				return (response.devices ?? []).map((device) => ({
					name: device.deviceName
						? `${device.deviceName} (${device.connectionStatus ?? 'unknown'})`
						: device.deviceId,
					value: device.deviceId,
				}));
			},
		},
	};
}
