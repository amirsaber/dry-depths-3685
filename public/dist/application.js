'use strict';
// Init the application configuration module for AngularJS application
var ApplicationConfiguration = function () {
    // Init module configuration options
    var applicationModuleName = 'deepdepth';
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
    var registerModule = function (moduleName, dependencies) {
      // Create angular module
      angular.module(moduleName, dependencies || []);
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
ApplicationConfiguration.registerModule('graphtypes');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('jobtypes');'use strict';
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
    this.defaultRoles = ['*'];
    // Define the menus object
    this.menus = {};
    // A private function for rendering decision 
    var shouldRender = function (user) {
      if (user) {
        if (!!~this.roles.indexOf('*')) {
          return true;
        } else {
          for (var userRoleIndex in user.roles) {
            for (var roleIndex in this.roles) {
              if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
                return true;
              }
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
    this.addMenuItem = function (menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Push new menu item
      this.menus[menuId].items.push({
        title: menuItemTitle,
        link: menuItemURL,
        menuItemType: menuItemType || 'item',
        menuItemClass: menuItemType,
        uiRoute: menuItemUIRoute || '/' + menuItemURL,
        isPublic: isPublic === null || typeof isPublic === 'undefined' ? this.menus[menuId].isPublic : isPublic,
        roles: roles === null || typeof roles === 'undefined' ? this.menus[menuId].roles : roles,
        position: position || 0,
        items: [],
        shouldRender: shouldRender
      });
      // Return the menu object
      return this.menus[menuId];
    };
    // Add submenu item object
    this.addSubMenuItem = function (menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
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
            isPublic: isPublic === null || typeof isPublic === 'undefined' ? this.menus[menuId].items[itemIndex].isPublic : isPublic,
            roles: roles === null || typeof roles === 'undefined' ? this.menus[menuId].items[itemIndex].roles : roles,
            position: position || 0,
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
// Configuring the Articles module
angular.module('fieldtypes').run([
  'Menus',
  function (Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', 'Fieldtypes', 'fieldtypes', 'dropdown', '/fieldtypes(/create)?', false, ['admin']);
    Menus.addSubMenuItem('topbar', 'fieldtypes', 'List Fieldtypes', 'fieldtypes');
    Menus.addSubMenuItem('topbar', 'fieldtypes', 'New Fieldtype', 'fieldtypes/create');
  }
]);'use strict';
//Setting up route
angular.module('fieldtypes').config([
  '$stateProvider',
  function ($stateProvider) {
    // Fieldtypes state routing
    $stateProvider.state('listFieldtypes', {
      url: '/fieldtypes',
      templateUrl: 'modules/fieldtypes/views/list-fieldtypes.client.view.html'
    }).state('createFieldtype', {
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
    //Fieldtype default types
    $scope.types = [
      'String',
      'Integer',
      'Boolean',
      'Date'
    ];
    // Create new Fieldtype
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
        // Clear form fields
        $scope.name = '';
        $scope.description = '';
        $scope.type = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
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
          $location.path('fieldtypes');
        });
      }
    };
    // Update existing Fieldtype
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
//Fieldtypes service used to communicate Fieldtypes REST endpoints
angular.module('fieldtypes').factory('Fieldtypes', [
  '$resource',
  function ($resource) {
    return $resource('fieldtypes/:fieldtypeId', { fieldtypeId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
// Configuring the Articles module
angular.module('graphtypes').run([
  'Menus',
  function (Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', 'Graphtypes', 'graphtypes', 'dropdown', '/graphtypes(/create)?', false, ['admin']);
    Menus.addSubMenuItem('topbar', 'graphtypes', 'List Graphtypes', 'graphtypes');
    Menus.addSubMenuItem('topbar', 'graphtypes', 'New Graphtype', 'graphtypes/create');
  }
]);'use strict';
//Setting up route
angular.module('graphtypes').config([
  '$stateProvider',
  function ($stateProvider) {
    // Graphtypes state routing
    $stateProvider.state('listGraphtypes', {
      url: '/graphtypes',
      templateUrl: 'modules/graphtypes/views/list-graphtypes.client.view.html'
    }).state('createGraphtype', {
      url: '/graphtypes/create',
      templateUrl: 'modules/graphtypes/views/create-graphtype.client.view.html'
    }).state('viewGraphtype', {
      url: '/graphtypes/:graphtypeId',
      templateUrl: 'modules/graphtypes/views/view-graphtype.client.view.html'
    }).state('editGraphtype', {
      url: '/graphtypes/:graphtypeId/edit',
      templateUrl: 'modules/graphtypes/views/edit-graphtype.client.view.html'
    });
  }
]);'use strict';
// Graphtypes controller
angular.module('graphtypes').controller('GraphtypesController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Graphtypes',
  function ($scope, $stateParams, $location, Authentication, Graphtypes) {
    $scope.authentication = Authentication;
    // Create new Graphtype
    $scope.create = function () {
      // Create new Graphtype object
      var graphtype = new Graphtypes({
          name: this.name,
          script: this.script
        });
      // Redirect after save
      graphtype.$save(function (response) {
        $location.path('graphtypes/' + response._id);
        // Clear form fields
        $scope.name = '';
        $scope.script = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Remove existing Graphtype
    $scope.remove = function (graphtype) {
      if (graphtype) {
        graphtype.$remove();
        for (var i in $scope.graphtypes) {
          if ($scope.graphtypes[i] === graphtype) {
            $scope.graphtypes.splice(i, 1);
          }
        }
      } else {
        $scope.graphtype.$remove(function () {
          $location.path('graphtypes');
        });
      }
    };
    // Update existing Graphtype
    $scope.update = function () {
      var graphtype = $scope.graphtype;
      graphtype.$update(function () {
        $location.path('graphtypes/' + graphtype._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Find a list of Graphtypes
    $scope.find = function () {
      $scope.graphtypes = Graphtypes.query();
    };
    // Find existing Graphtype
    $scope.findOne = function () {
      $scope.graphtype = Graphtypes.get({ graphtypeId: $stateParams.graphtypeId });
    };
  }
]);'use strict';
//Graphtypes service used to communicate Graphtypes REST endpoints
angular.module('graphtypes').factory('Graphtypes', [
  '$resource',
  function ($resource) {
    return $resource('graphtypes/:graphtypeId', { graphtypeId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
// Configuring the Articles module
angular.module('jobtypes').run([
  'Menus',
  function (Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', 'Jobtypes', 'jobtypes', 'dropdown', '/jobtypes(/create)?', false, ['admin']);
    Menus.addSubMenuItem('topbar', 'jobtypes', 'List Jobtypes', 'jobtypes');
    Menus.addSubMenuItem('topbar', 'jobtypes', 'New Jobtype', 'jobtypes/create');
  }
]);'use strict';
//Setting up route
angular.module('jobtypes').config([
  '$stateProvider',
  function ($stateProvider) {
    // Jobtypes state routing
    $stateProvider.state('listJobtypes', {
      url: '/jobtypes',
      templateUrl: 'modules/jobtypes/views/list-jobtypes.client.view.html'
    }).state('createJobtype', {
      url: '/jobtypes/create',
      templateUrl: 'modules/jobtypes/views/create-jobtype.client.view.html'
    }).state('viewJobtype', {
      url: '/jobtypes/:jobtypeId',
      templateUrl: 'modules/jobtypes/views/view-jobtype.client.view.html'
    }).state('editJobtype', {
      url: '/jobtypes/:jobtypeId/edit',
      templateUrl: 'modules/jobtypes/views/edit-jobtype.client.view.html'
    });
  }
]);'use strict';
// Jobtypes controller
angular.module('jobtypes').controller('JobtypesController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Jobtypes',
  'Fieldtypes',
  'Graphtypes',
  function ($scope, $stateParams, $location, Authentication, Jobtypes, Fieldtypes, Graphtypes) {
    $scope.authentication = Authentication;
    //Get availble Fieldtypes
    $scope.fieldtypes = Fieldtypes.query();
    //Get availble Graphtypes
    $scope.graphtypes = Graphtypes.query();
    //Initialize a temp jobtype
    $scope.init = function () {
      $scope.jobtype = {};
      $scope.jobtype.fields = [];
      $scope.jobtype.graphs = [];
    };
    //remove item from fields
    $scope.removeFromFields = function () {
      $scope.jobtype.fields.splice(this.$index, 1);
    };
    //Add selected Fieldtype to fields
    $scope.addToFields = function () {
      $scope.jobtype.fields.push($scope.myFieldtype);
    };
    //remove item from graphs
    $scope.removeFromGraphs = function () {
      $scope.jobtype.graphs.splice(this.$index, 1);
    };
    //Add selected Graphtype to graphs
    $scope.addToGraphs = function () {
      $scope.jobtype.graphs.push($scope.myGraphtype);
    };
    // Create new Jobtype
    $scope.create = function () {
      // Create new Jobtype object
      var jobtype = new Jobtypes({
          name: this.name,
          address: this.address,
          fields: this.jobtype.fields,
          graphs: this.jobtype.graphs,
          queryPattern: this.queryPattern
        });
      // Redirect after save
      jobtype.$save(function (response) {
        $location.path('jobtypes/' + response._id);
        // Clear form fields
        $scope.name = '';
        $scope.address = '';
        $scope.queryPattern = '';
        $scope.jobtype.fields = [];
        $scope.jobtype.graphs = [];
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Remove existing Jobtype
    $scope.remove = function (jobtype) {
      if (jobtype) {
        jobtype.$remove();
        for (var i in $scope.jobtypes) {
          if ($scope.jobtypes[i] === jobtype) {
            $scope.jobtypes.splice(i, 1);
          }
        }
      } else {
        $scope.jobtype.$remove(function () {
          $location.path('jobtypes');
        });
      }
    };
    // Update existing Jobtype
    $scope.update = function () {
      var jobtype = $scope.jobtype;
      jobtype.$update(function () {
        $location.path('jobtypes/' + jobtype._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Find a list of Jobtypes
    $scope.find = function () {
      $scope.jobtypes = Jobtypes.query();
    };
    // Find existing Jobtype
    $scope.findOne = function () {
      $scope.jobtype = Jobtypes.get({ jobtypeId: $stateParams.jobtypeId });
    };
  }
]);'use strict';
//Jobtypes service used to communicate Jobtypes REST endpoints
angular.module('jobtypes').factory('Jobtypes', [
  '$resource',
  function ($resource) {
    return $resource('jobtypes/:jobtypeId', { jobtypeId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
// Configuring the Articles module
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
  'Jobtypes',
  function ($scope, $stateParams, $location, Authentication, Queries, Jobtypes) {
    $scope.authentication = Authentication;
    //Get availble Jobtype
    $scope.jobtypes = Jobtypes.query();
    //Initialize a temp query
    $scope.init = function () {
      $scope.query = {};
      $scope.query.fields = [];
    };
    // Create new Query
    $scope.create = function () {
      // Create new Query object\
      var query = new Queries({
          name: this.name,
          job: this.myJobtype,
          fields: this.query.fields
        });
      // Redirect after save
      query.$save(function (response) {
        $location.path('queries/' + response._id);
        // Clear form fields
        $scope.name = '';
        $scope.myJobtype = {};
        $scope.fields = [];
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
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
    // On changing job type
    $scope.jobChange = function () {
      $scope.query.fields = [];
    };
    //On changing graph type
    $scope.graphChange = function () {
      $scope.myGraph = this.myGraphType;
      //Remove Previous script
      var graphScript = angular.element(document.querySelector('#graphScript'));
      graphScript.remove();
      var svgDiv = angular.element(document.querySelector('#svgDiv'));
      svgDiv.children().remove();
      //Create script tag and append it
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = $scope.myGraph.script;
      script.id = 'graphScript';
      //Get script div and append it
      var scriptDiv = angular.element(document.querySelector('#scriptDiv'));
      scriptDiv.append(script);
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
      templateUrl: 'modules/users/views/authentication/signup.client.view.html'
    }).state('signin', {
      url: '/signin',
      templateUrl: 'modules/users/views/authentication/signin.client.view.html'
    }).state('forgot', {
      url: '/password/forgot',
      templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
    }).state('reset-invlaid', {
      url: '/password/reset/invalid',
      templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
    }).state('reset-success', {
      url: '/password/reset/success',
      templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
    }).state('reset', {
      url: '/password/reset/:token',
      templateUrl: 'modules/users/views/password/reset-password.client.view.html'
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
    // If user is signed in then redirect back home
    if ($scope.authentication.user)
      $location.path('/');
    $scope.signup = function () {
      $http.post('/auth/signup', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;
        // And redirect to the index page
        $location.path('/');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    $scope.signin = function () {
      $http.post('/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;
        // And redirect to the index page
        $location.path('/');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
angular.module('users').controller('PasswordController', [
  '$scope',
  '$stateParams',
  '$http',
  '$location',
  'Authentication',
  function ($scope, $stateParams, $http, $location, Authentication) {
    $scope.authentication = Authentication;
    //If user is signed in then redirect back home
    if ($scope.authentication.user)
      $location.path('/');
    // Submit forgotten password account id
    $scope.askForPasswordReset = function () {
      $scope.success = $scope.error = null;
      $http.post('/auth/forgot', $scope.credentials).success(function (response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.success = response.message;
      }).error(function (response) {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.error = response.message;
      });
    };
    // Change user password
    $scope.resetUserPassword = function () {
      $scope.success = $scope.error = null;
      $http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;
        // Attach user profile
        Authentication.user = response;
        // And redirect to the index page
        $location.path('/password/reset/success');
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
    $scope.updateUserProfile = function (isValid) {
      if (isValid) {
        $scope.success = $scope.error = null;
        var user = new Users($scope.user);
        user.$update(function (response) {
          $scope.success = true;
          Authentication.user = response;
        }, function (response) {
          $scope.error = response.data.message;
        });
      } else {
        $scope.submitted = true;
      }
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