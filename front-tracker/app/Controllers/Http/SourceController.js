'use strict'

const Database = use('Database')

class SourceController {
	async get({ request, response, view }) {
		const sources = await Database.table('sources').select('*')

		return view.render('sources.edge', { sources: sources })
	}
}

module.exports = SourceController
