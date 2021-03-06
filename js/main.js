var app = angular.module("myApp", []);

//when angular routes to a specific page, it instantiates the designated controller for that page
app.config(function($routeProvider){
  $routeProvider.when('/',{
    templateUrl: "templates/home.html",
    controller: 'HomeController'
  })
  .when('/settings', {
    templateUrl: 'templates/settings.html',
    controller: 'SettingsController'
  })
  .otherwise({redirectTo: '/'})
});

app.service('mailService', ['$http', '$q', function($http, $q) {
  var getMail = function(){
    return $http({
      method: 'GET',
      url: '/api/mail'
    });
  };

  var sendEmail = function(mail){
      var d = $q.defer();
      $http({
        method: 'POST',
        data: mail,
        url: '/api/send'
      }).success(function(data,status,headers) {
        d.resolve(data);
      }).error(function(data,status,headers){
        d.reject(data);
      })
      return d.promise;
  }

  return {
    getMail: getMail,
    sendEmail: sendEmail
  }
}])

// this is what defines our home controller
//scope is a bridge between the dom element and the variable
app.controller('HomeController',function($scope){
$scope.selectedMail;

$scope.setSelectedMail = function(mail) {
  $scope.selectedMail = mail;
};

$scope.isSelected = function(mail){
  if ($scope.selectedMail) {
    return $scope.selectedMail == mail;
    }
  }
});

app.directive('emailListing', function(){
  return {
    restrict: 'EA', // specifiying what kind of directive this will be
    replace: false, // do we want to replace the elment or append
    scope: {
      email: '=', // accept an object as a parameter
      action: '&', // accept a function as a parameter
      shouldUseGraveter: '@' // accept string as parameter

    }, // we create an object hash which creates an isolate scope, meaning it doe not actually inherit from the parent scope. this is useful for reusable components so we dont manipulate the parent scope. the object hash defines how the local scope derives from the parent.
    templateUrl: '/templates/emailListing.html' // this template can now access the variables in our scope specified in this directive
  }
})

app.controller('ContentController',["$scope", "$rootScope", "mailService", function($scope, $rootScope, mailService){

$scope.showingReply = false;
$scope.reply = {};

$scope.toggleReplyForm = function(){
  $scope.showingReply = !$scope.showingReply;
  $scope.reply = {};
  $scope.reply.to = $scope.selectedMail.from.join(', ')
  $scope.reply.body = $scope.selectedMail.body;

}

$scope.sendReply = function() {
  $scope.showingReply = false;
  $rootScope.loading = true;
  mailService.sendEmail($scope.reply)
  .then(function(status){
    $rootScope.loading = false;
  },function(err){
    $rootScope.loading = false;
  });
}

$scope.$watch('selectedMail', function(evt){
$scope.showingReply = false;
$scope.reply = {}
})

}]);
app.controller('MailListingController',['$scope', 'mailService', function($scope, mailService){
  $scope.email = [];
  $scope.nYearsAgo = 20;


  mailService.getMail()
  .success(function(data,status,headers){
    $scope.email = data.all;
    console.log('success');

  })

  .error(function(data,status,headers){
    $scope.email = data.all
    console.log('error');
  });

$scope.searchPastNYears = function(email) {
  var emailSentAtDate = new Date(email.sent_at),
  nYearsAgoDate = new Date();

  nYearsAgoDate.setFullYear(nYearsAgoDate.getFullYear() - $scope.nYearsAgo)
  return emailSentAtDate > nYearsAgoDate;
}

}])

app.controller('SettingsController',function($scope){
$scope.settings = {
  name: 'jesse',
  email: "drrrreams@gmail.com"
}
$scope.updateSettings = function(){
  console.log('updateSettings was called');
}
})
