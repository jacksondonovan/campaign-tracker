'use strict'

const Database = use('Database')
const csv = require('csv-parser');
const fs = require('fs');

class CampaignController {
	/*
	Function to get all campaign data records with filter criteria
	@author Jackson Donovan
	*/
	async get({ request, response, view }) {
		const data = request.except(['_csrf'])
		let campaigns
		let where_conditions = 'campaigns.id IS NOT NULL'
		console.log('get campaign data: ', request.except(['_csrf']));

		if(data.product && data.product !== 'all') {
			where_conditions += ` AND product_id = ${data.product}`
		}
		if(data.source && data.source !== 'all') {
			where_conditions += ` AND source_id = ${data.source}`
		}

		if(!data.sort && !data.orderby) {
			campaigns = await Database
				.table('campaigns')
				.select('*', {source_name: 'adcellerant.sources.name'}, {product_name: 'adcellerant.products.name'})
				.leftJoin('products', 'campaigns.product_id', 'products.id')
				.leftJoin('sources', 'campaigns.source_id', 'sources.id')
				.whereRaw(where_conditions)
		}
		else {
			campaigns = await Database
				.table('campaigns')
				.select('*', {source_name: 'adcellerant.sources.name'}, {product_name: 'adcellerant.products.name'})
				.leftJoin('products', 'campaigns.product_id', 'products.id')
				.leftJoin('sources', 'campaigns.source_id', 'sources.id')
				.whereRaw(where_conditions)
				.orderBy(`sources.name`, data.order_by)
		}



		const products = await Database.table('products').select(['id', 'name'])
		const sources = await Database.table('sources').select(['id', 'name'])

		return view.render('campaigns.edge', {
			campaigns: campaigns,
			products: products,
			sources: sources
		 })
	}

	/*
	Function to insert csv file data into campaigns table.
	@author Jackson Donovan
	*/
	async add({ request, response, view }) {
		request._files['csv-file'].clientName = request._files['csv-file'].clientName.replace('.csv', '')
		let split_file_name = request._files['csv-file'].clientName.split('_')
		let source_name = split_file_name.shift()
		let campaign_date = split_file_name.join('-')

		fs.createReadStream(request._files['csv-file'].tmpPath)
		  .pipe(csv())
		  .on('data', async (row) => {
			  let source_record = await Database.table('sources').select('*').where('name', source_name)
			  let source_id = source_record[0].id
			  let product_record = await Database.table('products').select('*').where('name', row.product)
			  let product_id = product_record[0].id

			  await Database
			  .insert({
				  source_id: source_id,
				  product_id: product_id,
				  clicks: row.clicks,
				  campaign_date: campaign_date
			  })
			  .into('campaigns')
		  })
		  .on('end', () => {
		    console.log('CSV file successfully processed');
		  });

		  response.redirect('/campaigns')

	}
}

module.exports = CampaignController
