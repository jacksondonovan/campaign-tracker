'use strict'

const { getCampaigns, getTotalClicks, getAllProducts, getAllSources, addCampaignData } = require('../../../database/db-query')
const csv = require('csv-parser')
const fs = require('fs')

class CampaignController {
	/*
	Function to get all campaign data records with filter criteria
	*/
	async get({ request, response, view, params }) {
		const filter_criteria = request.all()
		let campaigns
		let products = await getAllProducts()
		let sources = await getAllSources()
		let current_pagination = (params.pagination) ? params.pagination : 1

		if(filter_criteria.product_clicks == 'true' || filter_criteria.source_clicks == 'true') {
			campaigns = await getTotalClicks(filter_criteria)
		}
		else {
			campaigns = await getCampaigns(filter_criteria, current_pagination)
		}

		return view.render('campaigns.edge', {
			campaigns,
			products,
			sources,
			filter_criteria,
			current_pagination
		 })
	}

	/*
	Function to insert csv file data into campaigns table.
	*/
	async add({ request, response, view }) {
		let products = await getAllProducts()
		let sources = await getAllSources()
		let [source_name, campaign_date] = this.parseFileName(request._files['csv-file'].clientName)
		let file_data = []

		fs.createReadStream(request._files['csv-file'].tmpPath)
		  .pipe(csv())
		  .on('data', (row) => {
			  file_data.push({
				  source_id: sources.find(source => source.name == source_name).id,
				  product_id: products.find(product => product.name == row.product).id,
				  clicks: row.clicks,
				  campaign_date: campaign_date
			  })
		  })
		  .on('end', async () => {
			  await addCampaignData(file_data)
		      console.log('CSV file successfully processed')
		  });

		  response.redirect('/campaigns')
	}

	parseFileName(file_name) {
		let client_name = file_name.replace('.csv', '')
		let split_file_name = client_name.split('_')

		return [split_file_name.shift(), split_file_name.join('-')]
	}

}

module.exports = CampaignController
