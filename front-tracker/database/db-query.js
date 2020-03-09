const Database = use('Database')
const PAGINATION_LIMIT = 75

async function getCampaigns(data, pagination) {
	let campaigns
	let where_conditions = setWhereConditions(data)
	let [query_contains_sort, column] = queryContainsSort(data)

	if(query_contains_sort) {
		campaigns = await Database
			.table('campaigns')
			.select('*', {source_name: 'adcellerant.sources.name'}, {product_name: 'adcellerant.products.name'})
			.leftJoin('products', 'campaigns.product_id', 'products.id')
			.leftJoin('sources', 'campaigns.source_id', 'sources.id')
			.whereRaw(where_conditions)
			.orderBy(column, data.order_by)
			.paginate(pagination, PAGINATION_LIMIT)
	}
	else {
		campaigns = await Database
			.table('campaigns')
			.select('*', {source_name: 'adcellerant.sources.name'}, {product_name: 'adcellerant.products.name'})
			.leftJoin('products', 'campaigns.product_id', 'products.id')
			.leftJoin('sources', 'campaigns.source_id', 'sources.id')
			.whereRaw(where_conditions)
			.paginate(pagination, PAGINATION_LIMIT)
	}

	return campaigns
}

async function getAllProducts() {
	let products = await Database
		.table('products')
		.select(['id', 'name'])

	return products
}

async function getAllSources() {
	let sources = await Database
		.table('sources')
		.select(['id', 'name'])

	return sources
}

async function addCampaignData(file_data) {
	await Database
		.insert(file_data)
		.into('campaigns')
}

async function getTotalClicks(data) {
	let query_params = []
	let click_sum_raw_query = 'SELECT SUM(campaigns.clicks) AS total_clicks, products.name AS product_clicks, sources.name AS source_clicks FROM campaigns LEFT JOIN products ON campaigns.product_id=products.id LEFT JOIN sources ON campaigns.source_id=sources.id WHERE campaigns.id IS NOT NULL'

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

	click_sum_raw_query += ' GROUP BY product_clicks, source_clicks'

	let total_clicks = await Database.raw(click_sum_raw_query, query_params)
	let click_counter = 0
	total_clicks[0].map((source_group) => {
		click_counter += source_group.total_clicks
	})

	let aggregate_data = total_clicks[0][0]
	let campaigns = {}

	campaigns.data = {
		total_clicks: click_counter,
		product_clicks: aggregate_data.product_clicks,
		source_clicks: aggregate_data.source_clicks
	}
	campaigns.lastPage = 1

	return campaigns
}

function setWhereConditions(filter_criteria) {
	let conditions = 'campaigns.id IS NOT NULL'
	let keys = Object.keys(filter_criteria)

	for(let i = 0; i < keys.length; i++) {
		if(keys[i] == 'product' && filter_criteria['product'] !== 'all') {
			conditions += ` AND ${keys[i]}_id = ${filter_criteria[keys[i]]}`
		}
		if(keys[i] == 'source' && filter_criteria['source'] !== 'all') {
			conditions += ` AND ${keys[i]}_id = ${filter_criteria[keys[i]]}`
		}
		if(keys[i] == 'date_from' && filter_criteria['date_from']) {
			conditions += ` AND (campaign_date >= '${filter_criteria[keys[i]]}')`
		}
		if(keys[i] == 'date_to' && filter_criteria['date_to']) {
			conditions += ` AND (campaign_date <= '${filter_criteria[keys[i]]}')`
		}
		if(keys[i] == 'click_threshold' && filter_criteria['click_threshold']) {
			conditions += ` AND (clicks >= ${Number(filter_criteria[keys[i]])})`
		}
	}

	return conditions
}

function queryContainsSort(filter_options) {
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

module.exports = {
	getCampaigns,
	getTotalClicks,
	getAllProducts,
	getAllSources,
	addCampaignData
}
