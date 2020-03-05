'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

const Database = use('Database')

Route.get('/users', async () => {
	return await Database.table('users').select('*')
})

Route.get('/sources', 			'SourceController.get')
Route.get('/products', 			'ProductController.get')
Route.get('/campaigns',			'CampaignController.get')
Route.post('/campaign/add',		'CampaignController.add')

Route.on('/').render('welcome')
