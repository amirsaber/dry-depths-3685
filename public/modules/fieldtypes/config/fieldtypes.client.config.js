'use strict';

// Configuring the Articles module
angular.module('fieldtypes').run(['Menus',

function(Menus) {
	// Set top bar menu items
	Menus.addMenuItem('topbar', 'Fieldtypes', 'fieldtypes', 'dropdown', '/fieldtypes(/create)?', false, ['admin']);
	Menus.addSubMenuItem('topbar', 'fieldtypes', 'List Fieldtypes', 'fieldtypes');
	Menus.addSubMenuItem('topbar', 'fieldtypes', 'New Fieldtype', 'fieldtypes/create');
}]);