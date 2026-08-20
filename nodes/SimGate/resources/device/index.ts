import type { INodeProperties } from 'n8n-workflow';

const showOnlyForDevices = {
	resource: ['device'],
};

const showOnlyForSingleDevice = {
	operation: ['get', 'getStatus'],
	resource: ['device'],
};

export const deviceDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForDevices },
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a device',
				description: 'Retrieve a single registered phone',
				routing: {
					request: {
						method: 'GET',
						url: '=/devices/{{$parameter.deviceId}}',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many devices',
				description: 'Retrieve every phone registered to your account',
				routing: {
					request: {
						method: 'GET',
						url: '/devices',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: { property: 'devices' },
							},
						],
					},
				},
			},
			{
				name: 'Get Status',
				value: 'getStatus',
				action: 'Get a device status',
				description: 'Check whether a phone is currently online',
				routing: {
					request: {
						method: 'GET',
						url: '=/devices/{{$parameter.deviceId}}/status',
					},
				},
			},
		],
		default: 'getAll',
	},
	{
		displayName: 'Device Name or ID',
		name: 'deviceId',
		type: 'options',
		typeOptions: { loadOptionsMethod: 'getDevices' },
		displayOptions: { show: showOnlyForSingleDevice },
		default: '',
		required: true,
		description:
			'The phone to look up. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];
