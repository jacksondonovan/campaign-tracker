'use strict'

const Database = use('Database')

class ProductController {
	async get({ request, response, view }) {
		const products = await Database.table('products').select('*')

		return view.render('products.edge', { products: products })
	}
}

module.exports = ProductController
