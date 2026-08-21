import type { INodeProperties } from 'n8n-workflow';

const showOnlyForMessageSend = {
	operation: ['send'],
	resource: ['message'],
};

export const messageSendDescription: INodeProperties[] = [
	{
		displayName: 'Device',
		name: 'deviceId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		displayOptions: { show: showOnlyForMessageSend },
		description: 'The phone that sends the SMS',
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'searchDevices',
					searchable: true,
				},
			},
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: 'android-5q15b182f2704gbz',
			},
		],
		// RoutingNode extracts resourceLocator values before send, so this receives the ID string
		routing: { send: { type: 'body', property: 'deviceId' } },
	},
	{
		displayName: 'To',
		name: 'phoneNumber',
		type: 'string',
		displayOptions: { show: showOnlyForMessageSend },
		default: '',
		required: true,
		placeholder: '+391234567890',
		description: 'Recipient phone number in international format',
		routing: { send: { type: 'body', property: 'phoneNumber' } },
	},
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		typeOptions: { rows: 4 },
		displayOptions: { show: showOnlyForMessageSend },
		default: '',
		required: true,
		description: 'Text of the SMS to send',
		routing: { send: { type: 'body', property: 'message' } },
	},
	{
		displayName: 'Test Mode',
		name: 'test',
		type: 'boolean',
		displayOptions: { show: showOnlyForMessageSend },
		default: false,
		description:
			'Whether to count this message against your test quota instead of your SMS quota',
		routing: { send: { type: 'body', property: 'test' } },
	},
];
