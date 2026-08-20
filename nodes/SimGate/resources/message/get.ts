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
];
