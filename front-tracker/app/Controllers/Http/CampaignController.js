'use strict'

const Database = use('Database')
const csv = require('csv-parser')
const fs = require('fs')
const moment = require('moment')
const PAGINATION_LIMIT = 75

class CampaignController {
	/*
	Function to get all campaign data records with filter criteria
	@author Jackson Donovan
	*/
	async get({ request, response, view, params }) {
		const data = request.except(['_csrf'])
		let campaigns
		let where_conditions = this.setWhereConditions(data)
		let [query_contains_sort, column] = this.queryContainsSort(data)
		let prev_criteria = {
			prev_sort_by: data.sort || '',
			prev_order_by: data.order_by || '',
			prev_product_filter: data.product || '',
			prev_source_filter: data.source || '',
			prev_date_from : data.date_from || '',
			prev_date_to: data.date_to || '',
			prev_click_threshold: data.click_threshold || ''
		}
		params.pagination = (params.pagination) ? params.pagination : 1

		// If the query doesn't include sort, omit the .orderBy() method.
		if(query_contains_sort) {
			campaigns = await Database
				.table('campaigns')
				.select('*', {source_name: 'adcellerant.sources.name'}, {product_name: 'adcellerant.products.name'})
				.leftJoin('products', 'campaigns.product_id', 'products.id')
				.leftJoin('sources', 'campaigns.source_id', 'sources.id')
				.whereRaw(where_conditions)
				.orderBy(column, data.order_by)
				.paginate(params.pagination, PAGINATION_LIMIT)
		}
		else {
			campaigns = await Database
				.table('campaigns')
				.select('*', {source_name: 'adcellerant.sources.name'}, {product_name: 'adcellerant.products.name'})
				.leftJoin('products', 'campaigns.product_id', 'products.id')
				.leftJoin('sources', 'campaigns.source_id', 'sources.id')
				.whereRaw(where_conditions)
				.paginate(params.pagination, PAGINATION_LIMIT)
		}

		//turn this and maybe the conditional above this, into a function. campaigns = ()
		if(data.product_clicks == 'true' || data.source_clicks == 'true') {
			let click_sum_raw_query = 'SELECT SUM(campaigns.clicks) AS total_clicks FROM campaigns LEFT JOIN products ON campaigns.product_id=products.id LEFT JOIN sources ON campaigns.source_id=sources.id WHERE campaigns.id > 0'

			let query_params = []

			if(data.product !== 'all') {
				click_sum_raw_query += ' AND product_id = ?'
				query_params.push(data.product)
			}
			if(data.source !== 'all') {
				click_sum_raw_query += ' AND source_id = ?'
				query_params.push(data.source)
			}
			if(data.date_from !== '') {
				click_sum_raw_query += ' AND (campaign_date >= ?)'
				query_params.push(data.date_from)
			}
			if(data.date_to !== '') {
				click_sum_raw_query += ' AND (campaign_date <= ?)'
				query_params.push(data.date_to)
			}

			let total_clicks = await Database.raw(click_sum_raw_query, query_params)

			total_clicks = total_clicks[0]
			campaigns.data.total_clicks = total_clicks[0].total_clicks
		}

		return view.render('campaigns.edge', {
			campaigns: campaigns,
			products: await Database.table('products').select(['id', 'name']) || '',
			sources: await Database.table('sources').select(['id', 'name']) || '',
			prev_criteria: prev_criteria,
			current_pagination: params.pagination
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

	setWhereConditions(data) {
		let conditions = 'campaigns.id IS NOT NULL'
		let keys = Object.keys(data)

		for(let i = 0; i < keys.length; i++) {
			if(keys[i] == 'product' && data['product'] !== 'all') {
				conditions += ` AND ${keys[i]}_id = ${data[keys[i]]}`
			}
			if(keys[i] == 'source' && data['source'] !== 'all') {
				conditions += ` AND ${keys[i]}_id = ${data[keys[i]]}`
			}
			if(keys[i] == 'date_from' && data['date_from']) {
				conditions += ` AND (campaign_date >= '${data[keys[i]]}')`
			}
			if(keys[i] == 'date_to' && data['date_to']) {
				conditions += ` AND (campaign_date <= '${data[keys[i]]}')`
			}
			if(keys[i] == 'click_threshold' && data['click_threshold']) {
				conditions += ` AND (clicks >= ${Number(data[keys[i]])})`
			}
		}

		return conditions
	}

	queryContainsSort(filter_options) {
		if(filter_options.sort && filter_options.order_by) {
			let sort_by
			if(filter_options.sort == 'product') {
				sort_by = 'products.name'
			}
			else if(filter_options.sort == 'source') {
				sort_by = 'sources.name'
			}
			else if(filter_options.sort == 'clicks') {
				sort_by = 'campaigns.clicks'
			}
			else if(filter_options.sort == 'date') {
				sort_by = 'campaigns.campaign_date'
			}
			return [true, sort_by]
		}
		return [false, false]
	}
}

module.exports = CampaignController
