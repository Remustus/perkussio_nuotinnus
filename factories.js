// D3 Factory
angular.module('djeInstruments',[])
    
.factory('d3' ,function() {
  return d3;
})

// D3 Loader service
.factory('SimpleD3Loader', ["d3", 
  function(d3) {
    return function(url, callback) {
      d3.text(url, 'text/plain', callback);
    };
}])

// Simple Http loader service
.factory('SimpleHttpLoader', ["$http",
  function($http) {
        console.log("SimpleHttpLoader factory - outer");
    return function(url) {
        console.log("SimpleHttpLoader factory - inner function, url: " + url);
      return $http.get(url, { cache: true });
    }
}])

.factory('rhythmService', ["$http",
  function($http) {
      console.log("rhythmService factory - outer");
    var getRhy = function(url) {
        console.log("rhythmService factory - inner function, url: " + url);
      return $http.get('files/' + url + '.json', { cache: true });
    }
    
    var getRhyys = function(rhythmFile){
        return $http.get(rhythmFile, { cache: true });
    }
    
    /*var getRhyys = function(){
        return $http.get('files/rhythms.json', { cache: true });
    }*/
    
    return{
        getRhythm:getRhy,
        getRhythms: getRhyys
    }
}])

.factory('instrumentService', ["$http",
  function($http) {
      console.log("instrumentService factory - outer");
    var getDefaultSet = function() {
        console.log("instrumentService factory - inner function");
      return $http.get('files/default_instrument_group.json', { cache: true });
    }
    
    var getInstrumentSounds = function() {
      return $http.get('files/instrument_sounds.json', { cache: true });
    }
    
    return{
        getDefaultInstruments: getDefaultSet,
        getSoundChannels: getInstrumentSounds
    }
}])
// Multi-File Http loader service 
.factory('HttpLoader', ["$http", "$q",
  function($http, $q) {
    return function(url) {

      /* Create an array of urls */
      var urls = [].concat( url );

      /* Create the Promises */
      var promises = urls.map(function(url) {
        return $http.get(url, { cache: true });
      });

      /* Queue the promises */
      return $q.all(promises);
    };
}])

.factory('Sound', function ($http) {
    var _defaultErr = function (err) {
      console.warn(err);
    };

    var User = function (idOrData) {
      if (angular.isNumber(idOrData)) {
        this.id = idOrData;
        this.load();
      } else if (angular.isObject(idOrData)) {
        this.update(data);
      }
      return this;
    };

    User.prototype = {
      load: function (id) {
        if (angular.isDefined(id)) {
          this.id = id;
        };
        var self = this;
        $http.get('data/user-' + this.id + '.json')
          .success(function (response) {
            self.update(response);
          })
          .error(_defaultErr);

        return this;
      },
      setDynamics: function () {
        this.fullName = this.firstName + ' ' + this.lastName;
        return this;
      },
      update: function (data) {
        angular.extend(this, data || {});
        this.setDynamics();
        return this;
      }
    };

    return {
      new: function (data) {
        return new User(data);
      }
    }
  })
  .factory('Members', function (User) {
    var Members = function (data) {
      if (angular.isArray(data)) {
        this.loadUsers(data);
      } else if (angular.isObject(data)) {
        this.update(data);
      }
      return this;
    }

    Members.prototype = {
      update: function (data) {
        angular.extend(this, data || {});
        if (this.userIds) {
          var ids = this.userIds;
            //delete originals in case they are used in front-end 2) asyncronicity 3) possible infinite loops depending of the implementation.
          delete this.userIds;
          this.loadUsers(ids);
        };
        return this;
      },
      loadUsers: function (userIds) {
        if (!this.users) {
          this.users = [];
        } else {
          this.users.splice(0, Number.MAX_VALUE);
        }
        for (var i = 0, ii = userIds.length; i < ii; i++) {
          this.users.push(User.new(userIds[i]));
        }
        return this;
      }
    };

    return {
      new: function (ids) {
        return new Members(ids);
      }
    }
  })
  .controller('CourseCtrl', function ($scope, Members) {
    $scope.members = Members.new([123, 456,124]);
  });






