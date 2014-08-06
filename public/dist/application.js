'use strict';
// Init the application configuration module for AngularJS application
var ApplicationConfiguration = function () {
    // Init module configuration options
    var applicationModuleName = 'dry-depth';
    var applicationModuleVendorDependencies = [
        'ngResource',
        'ngCookies',
        'ngAnimate',
        'ngTouch',
        'ngSanitize',
        'ui.router',
        'ui.bootstrap',
        'ui.utils'
      ];
    // Add a new vertical module
    var registerModule = function (moduleName) {
      // Create angular module
      angular.module(moduleName, []);
      // Add the module to the AngularJS configuration file
      angular.module(applicationModuleName).requires.push(moduleName);
    };
    return {
      applicationModuleName: applicationModuleName,
      applicationModuleVendorDependencies: applicationModuleVendorDependencies,
      registerModule: registerModule
    };
  }();'use strict';
//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);
// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config([
  '$locationProvider',
  function ($locationProvider) {
    $locationProvider.hashPrefix('!');
  }
]);
//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash === '#_=_')
    window.location.hash = '#!';
  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('fieldtypes');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('queries');'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');'use strict';
// Setting up route
angular.module('core').config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    // Redirect to home view when route not found
    $urlRouterProvider.otherwise('/');
    // Home state routing
    $stateProvider.state('home', {
      url: '/',
      templateUrl: 'modules/core/views/home.client.view.html'
    });
  }
]);'use strict';
angular.module('core').controller('HeaderController', [
  '$scope',
  'Authentication',
  'Menus',
  function ($scope, Authentication, Menus) {
    $scope.authentication = Authentication;
    $scope.isCollapsed = false;
    $scope.menu = Menus.getMenu('topbar');
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };
    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
  }
]);'use strict';
angular.module('core').controller('HomeController', [
  '$scope',
  'Authentication',
  function ($scope, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
  }
]);'use strict';
//Menu service used for managing  menus
angular.module('core').service('Menus', [function () {
    // Define a set of default roles
    this.defaultRoles = ['user'];
    // Define the menus object
    this.menus = {};
    // A private function for rendering decision 
    var shouldRender = function (user) {
      if (user) {
        for (var userRoleIndex in user.roles) {
          for (var roleIndex in this.roles) {
            if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
              return true;
            }
          }
        }
      } else {
        return this.isPublic;
      }
      return false;
    };
    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exists');
        }
      } else {
        throw new Error('MenuId was not provided');
      }
      return false;
    };
    // Get the menu object by menu id
    this.getMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Return the menu object
      return this.menus[menuId];
    };
    // Add new menu object by menu id
    this.addMenu = function (menuId, isPublic, roles) {
      // Create the new menu
      this.menus[menuId] = {
        isPublic: isPublic || false,
        roles: roles || this.defaultRoles,
        items: [],
        shouldRender: shouldRender
      };
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Return the menu object
      delete this.menus[menuId];
    };
    // Add menu item object
    this.addMenuItem = function (menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Push new menu item
      this.menus[menuId].items.push({
        title: menuItemTitle,
        link: menuItemURL,
        menuItemType: menuItemType || 'item',
        menuItemClass: menuItemType,
        uiRoute: menuItemUIRoute || '/' + menuItemURL,
        isPublic: isPublic || this.menus[menuId].isPublic,
        roles: roles || this.defaultRoles,
        items: [],
        shouldRender: shouldRender
      });
      // Return the menu object
      return this.menus[menuId];
    };
    // Add submenu item object
    this.addSubMenuItem = function (menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: menuItemTitle,
            link: menuItemURL,
            uiRoute: menuItemUIRoute || '/' + menuItemURL,
            isPublic: isPublic || this.menus[menuId].isPublic,
            roles: roles || this.defaultRoles,
            shouldRender: shouldRender
          });
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    //Adding the topbar menu
    this.addMenu('topbar');
  }]);'use strict';
// Configuring the Fieldtypes module
angular.module('fieldtypes').run([
  'Menus',
  function (Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', 'Field types', 'fieldtypes', 'dropdown', '/fieldtypes(/create)?', false, ['admin']);
    Menus.addSubMenuItem('topbar', 'fieldtypes', 'List Fieldtypes', 'fieldtypes');
    Menus.addSubMenuItem('topbar', 'fieldtypes', 'New Fieldtype', 'fieldtypes/create');
  }
]);'use strict';
//Setting up route
angular.module('fieldtypes').config([
  '$stateProvider',
  function ($stateProvider) {
    // Queries state routing
    $stateProvider.state('listFieldtypes', {
      url: '/fieldtypes',
      templateUrl: 'modules/fieldtypes/views/list-fieldtypes.client.view.html'
    }).state('createFieldType', {
      url: '/fieldtypes/create',
      templateUrl: 'modules/fieldtypes/views/create-fieldtype.client.view.html'
    }).state('viewFieldtype', {
      url: '/fieldtypes/:fieldtypeId',
      templateUrl: 'modules/fieldtypes/views/view-fieldtype.client.view.html'
    }).state('editFieldtype', {
      url: '/fieldtypes/:fieldtypeId/edit',
      templateUrl: 'modules/fieldtypes/views/edit-fieldtype.client.view.html'
    });
  }
]);'use strict';
// Fieldtypes controller
angular.module('fieldtypes').controller('FieldtypesController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Fieldtypes',
  function ($scope, $stateParams, $location, Authentication, Fieldtypes) {
    $scope.authentication = Authentication;
    // Create new FieldType
    $scope.create = function () {
      // Create new Fieldtype object
      var fieldtype = new Fieldtypes({
          name: this.name,
          description: this.description,
          type: this.type
        });
      // Redirect after save
      fieldtype.$save(function (response) {
        $location.path('fieldtypes/' + response._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
      // Clear form fields
      this.name = '';
      this.description = '';
      this.type = '';
    };
    // Remove existing Fieldtype
    $scope.remove = function (fieldtype) {
      if (fieldtype) {
        fieldtype.$remove();
        for (var i in $scope.fieldtypes) {
          if ($scope.fieldtypes[i] === fieldtype) {
            $scope.fieldtypes.splice(i, 1);
          }
        }
      } else {
        $scope.fieldtype.$remove(function () {
          $location.path('fieldtype');
        });
      }
    };
    // Update existing FieldType
    $scope.update = function () {
      var fieldtype = $scope.fieldtype;
      fieldtype.$update(function () {
        $location.path('fieldtypes/' + fieldtype._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Find a list of Fieldtypes
    $scope.find = function () {
      $scope.fieldtypes = Fieldtypes.query();
    };
    // Find existing Fieldtype
    $scope.findOne = function () {
      $scope.fieldtype = Fieldtypes.get({ fieldtypeId: $stateParams.fieldtypeId });
    };
  }
]);'use strict';
//Fieldtype service used to communicate Fieldtype REST endpoints
angular.module('fieldtypes').factory('Fieldtypes', [
  '$resource',
  function ($resource) {
    return $resource('fieldtypes/:fieldtypeId', { fieldtypeId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
// Configuring the Queries module
angular.module('queries').run([
  'Menus',
  function (Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', 'Queries', 'queries', 'dropdown', '/queries(/create)?');
    Menus.addSubMenuItem('topbar', 'queries', 'List Queries', 'queries');
    Menus.addSubMenuItem('topbar', 'queries', 'New Query', 'queries/create');
  }
]);'use strict';
//Setting up route
angular.module('queries').config([
  '$stateProvider',
  function ($stateProvider) {
    // Queries state routing
    $stateProvider.state('listQueries', {
      url: '/queries',
      templateUrl: 'modules/queries/views/list-queries.client.view.html'
    }).state('createQuery', {
      url: '/queries/create',
      templateUrl: 'modules/queries/views/create-query.client.view.html'
    }).state('viewQuery', {
      url: '/queries/:queryId',
      templateUrl: 'modules/queries/views/view-query.client.view.html'
    }).state('editQuery', {
      url: '/queries/:queryId/edit',
      templateUrl: 'modules/queries/views/edit-query.client.view.html'
    });
  }
]);'use strict';
// Queries controller
angular.module('queries').controller('QueriesController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Queries',
  function ($scope, $stateParams, $location, Authentication, Queries) {
    $scope.authentication = Authentication;
    // Create new Query
    $scope.create = function () {
      // Create new Query object
      var query = new Queries({ name: this.name });
      // Redirect after save
      query.$save(function (response) {
        $location.path('queries/' + response._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
      // Clear form fields
      this.name = '';
    };
    // Remove existing Query
    $scope.remove = function (query) {
      if (query) {
        query.$remove();
        for (var i in $scope.queries) {
          if ($scope.queries[i] === query) {
            $scope.queries.splice(i, 1);
          }
        }
      } else {
        $scope.query.$remove(function () {
          $location.path('queries');
        });
      }
    };
    // Update existing Query
    $scope.update = function () {
      var query = $scope.query;
      query.$update(function () {
        $location.path('queries/' + query._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Find a list of Queries
    $scope.find = function () {
      $scope.queries = Queries.query();
    };
    // Find existing Query
    $scope.findOne = function () {
      $scope.query = Queries.get({ queryId: $stateParams.queryId });
    };
  }
]);'use strict';
//Queries service used to communicate Queries REST endpoints
angular.module('queries').factory('Queries', [
  '$resource',
  function ($resource) {
    return $resource('queries/:queryId', { queryId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
// Config HTTP Error Handling
angular.module('users').config([
  '$httpProvider',
  function ($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push([
      '$q',
      '$location',
      'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
            case 401:
              // Deauthenticate the global user
              Authentication.user = null;
              // Redirect to signin page
              $location.path('signin');
              break;
            case 403:
              // Add unauthorized behaviour 
              break;
            }
            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);'use strict';
// Setting up route
angular.module('users').config([
  '$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider.state('profile', {
      url: '/settings/profile',
      templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
    }).state('password', {
      url: '/settings/password',
      templateUrl: 'modules/users/views/settings/change-password.client.view.html'
    }).state('accounts', {
      url: '/settings/accounts',
      templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
    }).state('signup', {
      url: '/signup',
      templateUrl: 'modules/users/views/signup.client.view.html'
    }).state('signin', {
      url: '/signin',
      templateUrl: 'modules/users/views/signin.client.view.html'
    });
  }
]);'use strict';
angular.module('users').controller('AuthenticationController', [
  '$scope',
  '$http',
  '$location',
  'Authentication',
  function ($scope, $http, $location, Authentication) {
    $scope.authentication = Authentication;
    //If user is signed in then redirect back home
    if ($scope.authentication.user)
      $location.path('/');
    $scope.signup = function () {
      $http.post('/auth/signup', $scope.credentials).success(function (response) {
        //If successful we assign the response to the global user model
        $scope.authentication.user = response;
        //And redirect to the index page
        $location.path('/');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    $scope.signin = function () {
      $http.post('/auth/signin', $scope.credentials).success(function (response) {
        //If successful we assign the response to the global user model
        $scope.authentication.user = response;
        //And redirect to the index page
        $location.path('/');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
angular.module('users').controller('SettingsController', [
  '$scope',
  '$http',
  '$location',
  'Users',
  'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;
    // If user is not signed in then redirect back home
    if (!$scope.user)
      $location.path('/');
    // Check if there are additional accounts 
    $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }
      return false;
    };
    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || $scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider];
    };
    // Remove a user social account
    $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null;
      $http.delete('/users/accounts', { params: { provider: provider } }).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    // Update a user profile
    $scope.updateUserProfile = function () {
      $scope.success = $scope.error = null;
      var user = new Users($scope.user);
      user.$update(function (response) {
        $scope.success = true;
        Authentication.user = response;
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
    // Change user password
    $scope.changeUserPassword = function () {
      $scope.success = $scope.error = null;
      $http.post('/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
// Authentication service for user variables
angular.module('users').factory('Authentication', [function () {
    var _this = this;
    _this._data = { user: window.user };
    return _this._data;
  }]);'use strict';
// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', [
  '$resource',
  function ($resource) {
    return $resource('users', {}, { update: { method: 'PUT' } });
  }
]);