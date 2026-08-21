import type { INodeProperties } from 'n8n-workflow';

const showOnlyForMessageGet = {
	operation: ['get'],
	resource: ['message'],
};

export const messageGetDescription: INodeProperties[] = [
	{
		displayName: 'Message ID',
		name: 'messageId',
		type: 'string',
		displayOptions: { show: showOnlyForMessageGet },
		default: '',
		required: true,
		description: 'The ID returned by a previous Send operation',
	},
	{
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		displayOptions: { show: showOnlyForMessageGet },
		default: true,
		description:
			'Whether to return a simplified version of the response instead of all the delivery fields',
		routing: {
			output: {
				postReceive: [
					{
						type: 'setKeyValue',
						enabled: '={{ $value }}',
						properties: {
							id: '={{ $responseItem.id }}',
							status: '={{ $responseItem.status }}',
							queued: '={{ $responseItem.queued }}',
							to: '={{ $responseItem.to }}',
							deviceId: '={{ $responseItem.deviceId }}',
							errorMessage: '={{ $responseItem.errorMessage }}',
							completedAt: '={{ $responseItem.completedAt }}',
						},
					},
				],
			},
		},
	},
];
