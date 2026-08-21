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
						url: '=/devices/{{ $parameter.deviceId.value }}',
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
						url: '=/devices/{{ $parameter.deviceId.value }}/status',
					},
				},
			},
		],
		default: 'getAll',
	},
	{
		displayName: 'Device',
		name: 'deviceId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		displayOptions: { show: showOnlyForSingleDevice },
		description: 'The phone to look up',
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
	},
];
