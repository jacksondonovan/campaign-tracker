'use strict'

const { getAllSources } = require('../../../database/db-query')

class SourceController {
	async get({ view }) {
		const sources = await getAllSources()

		return view.render('sources.edge', { sources: sources })
	}
}

module.exports = SourceController
