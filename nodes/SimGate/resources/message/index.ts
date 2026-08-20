import type { INodeProperties } from 'n8n-workflow';
import { messageGetDescription } from './get';
import { messageSendDescription } from './send';

const showOnlyForMessages = {
	resource: ['message'],
};

export const messageDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForMessages },
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a message',
				description: 'Retrieve the delivery status of a sent message',
				routing: {
					request: {
						method: 'GET',
						url: '=/messages/{{$parameter.messageId}}',
					},
				},
			},
			{
				name: 'Send',
				value: 'send',
				action: 'Send an SMS',
				description: 'Send an SMS from one of your phones',
				routing: {
					request: {
						method: 'POST',
						url: '/sms/send',
					},
				},
			},
		],
		default: 'send',
	},
	...messageGetDescription,
	...messageSendDescription,
];
