
//NOT YET WORKING CORRECTLY

const statsSchema = {
	params: {
		type: 'object',
		properties: {
			id: { type: 'integer', minimum: 1},
		},
		required: ['id'],
	},
	response: {
		200: {
			type: 'object',
			properties: {
				// id: { type: 'integer', minimum: 1 },
				// username: { type: 'string', minLength: 1 },
				totalWins: { type: 'integer', minimum: 0 },
				totalLosses: { type: 'integer', minimum: 0 },
				totalTournamentsWon: { type: 'integer', minimum: 0 },
				matchHistory: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							opponent: { type: 'string', minLength: 1 },
							winner: { type: 'string', minLength: 1 },
							leftScore: { type: 'integer', minimum: 0 },
							rightScore: { type: 'integer', minimum: 0 },
							date: { type: 'string', format: 'date-time' },
						},
						required: ['opponent', 'winner', 'leftScore', 'rightScore', 'date']
					}
				},

			},
			required: ['totalWins', 'totalLosses', 'totalTournamentsWon', 'matchHistory'],
		},
  }
}