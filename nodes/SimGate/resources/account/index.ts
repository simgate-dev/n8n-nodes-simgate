import type { INodeProperties } from 'n8n-workflow';

const showOnlyForAccount = {
	resource: ['account'],
};

export const accountDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForAccount },
		options: [
			{
				name: 'Get Usage',
				value: 'getUsage',
				action: 'Get account usage',
				description: 'Retrieve your plan and remaining SMS quota',
				routing: {
					request: {
						method: 'GET',
						url: '/usage',
					},
				},
			},
		],
		default: 'getUsage',
	},
];
