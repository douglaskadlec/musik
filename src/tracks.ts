type TrackId = `musik${string}`

interface Track {
	id: TrackId
	title: string
	length: string
}

export const tracks: Track[] = [
	{
		id: 'musik001',
		title: 'The Human Soul',
		length: '46:30'
	},
	{
		id: 'musik002',
		title: 'Magic of the Mind',
		length: '37:40'
	},
	{
		id: 'musik003',
		title: 'One In A Million We Are TWICE',
		length: '1:07:49'
	},
	{
		id: 'musik004',
		title: 'Another TWICE Mix to Feed Your Soul',
		length: '53:06'
	},
	{
		id: 'musik005',
		title: 'Journey of the Mind',
		length: '35:15'
	},
	{
		id: 'musik006',
		title: 'Seize the Light',
		length: '1:07:15'
	}
] as const