'use strict'

const { getCampaigns, getTotalClicks, getAllProducts, getAllSources, getProductByName, getSourceByName, addCampaignData } = require('../../../database/db-query')
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
		request._files['csv-file'].clientName = request._files['csv-file'].clientName.replace('.csv', '')
		let split_file_name = request._files['csv-file'].clientName.split('_')
		let source_name = split_file_name.shift()
		let campaign_date = split_file_name.join('-')

		fs.createReadStream(request._files['csv-file'].tmpPath)
		  .pipe(csv())
		  .on('data', async (row) => {
			  let product_record = await getProductByName(row.product)
			  let source_record = await getSourceByName(source_name)
			  let campaign_data = {
				  source_id: source_record[0].id,
				  product_id: product_record[0].id,
				  clicks: row.clicks,
				  campaign_date: campaign_date
			  }

			  await addCampaignData(campaign_data)
		  })
		  .on('end', () => {
		    console.log('CSV file successfully processed')
		  });

		  response.redirect('/campaigns')
	}

}

module.exports = CampaignController
