import type { INodeProperties } from 'n8n-workflow';

const showOnlyForMessageSend = {
	operation: ['send'],
	resource: ['message'],
};

export const messageSendDescription: INodeProperties[] = [
	{
		displayName: 'Device Name or ID',
		name: 'deviceId',
		type: 'options',
		typeOptions: { loadOptionsMethod: 'getDevices' },
		displayOptions: { show: showOnlyForMessageSend },
		default: '',
		required: true,
		description:
			'The phone that sends the SMS. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
