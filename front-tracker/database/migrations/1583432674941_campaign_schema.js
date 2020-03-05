'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CampaignSchema extends Schema {
  up () {
    this.create('campaigns', (table) => {
      table.increments()
	  table.integer('source_id')
	  table.integer('product_id')
	  table.integer('clicks')
	  table.string('campaign_date')
      table.timestamps()
    })
  }

  down () {
    this.drop('campaigns')
  }
}

module.exports = CampaignSchema
