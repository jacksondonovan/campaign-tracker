'use strict'

const { getAllProducts } = require('../../../database/db-query')

class ProductController {
	async get({ view }) {
		const products = await getAllProducts()

		return view.render('products.edge', { products: products })
	}
}

module.exports = ProductController
