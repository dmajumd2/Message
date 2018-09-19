var app = angular.module('myapp', ['ngRoute', 'ngCookies']);

app.config(function($routeProvider){
    $routeProvider.when('/' , {
        template : `
        <button type="button", ng-click="signUp()" class="btn btn-primary">Sign Up Please</button>
        `,
        controller: 'initialCtrl'
    })
    .when('/registration', {
        templateUrl: '/registration.html',
        controller: 'registrationCtrl'
    })
    .when('/login',{
        templateUrl:  '/login.html',
        controller: 'loginCtrl'
    })
    .when('/home', {
        templateUrl: '/home.html',
        controller: 'homeCtrl',
        resolve: ['authService', function(authService){
            return authService.checkuserstatus();
        }]
    })
    .when('/profile', {
        templateUrl: '/profile.html',
        controller: 'profileCtrl',
        resolve: ['authService', function(authService){
            return authService.checkuserstatus();
        }]
    })
    .when('/messages', {
        templateUrl: '/message.html',
        controller: 'messageCtrl',
        resolve: ['authService', function(authService){
            return authService.checkuserstatus();
        }]
    })
    .when('/msgdetails', {
        templateUrl: '/messagedetails.html',
        controller: 'messagedetailsCtrl',
        resolve: ['authService', function(authService){
            return authService.checkuserstatus();
        }]
    })
    
    
});

app.factory('authService', function($location, $http, $cookieStore, $q){
    return {
        'checkuserstatus': function(){
            let userObj = $cookieStore.get('userObj');
            var defer = $q.defer();
            if(userObj){
                if(userObj.data.isLoggedIn){
                    console.log(userObj.data.isLoggedIn);
                    defer.resolve("Valid user session");
                }
                else{
                    defer.reject();
                    $location.path('/login');
                }
            } 
            else{
                defer.reject("Invalid user session!");
                $location.path('/login');
            }
            return defer.promise;  
    }
}; 
});

///////////////////////////initial controller//////////////////////////
app.controller('initialCtrl', function($scope, $location){
    $scope.signUp =  function() {
        $location.path('/registration');
    }
});

///////////////////////////////////REGISTRATION CONTROLLER///////////////////////
app.controller('registrationCtrl', function($scope, $location, $http, $cookieStore){
    $scope.register = function(regform){
        console.log(regform);
        //$cookieStore.put('category', regform.selectCategory);
        //console.log(MyService.savedJobsArray);
        $http.post('http://localhost:3000/register', $scope.regform).then(function(resp){
            $location.path('/login');   
         });  
          alert("Registered successfully"); 
    }
});

//////////////////////////////PROFILE CONTROLLER///////////////////////////////
app.controller('profileCtrl', function($scope, $location, $http, $cookieStore){
    $scope.register = function(regform){
        console.log(regform);
        var userObj = $cookieStore.get('userObj');
        var obj = {
            userdetails: regform,
            user : userObj.data.data.username
        }
        console.log(obj);
        $http.post('http://localhost:3000/profile', obj).then(function(resp){
            console.log(resp);   
         });  
           alert("Updated successfully"); 
    }
});



/////////////////////////////////LOGIN CONTROLLER////////////////////////////////////////
app.controller('loginCtrl', function($scope, $http, $location, $cookieStore){
    $scope.login = function(authform) {
        console.log(authform);
       $http.post('http://localhost:3000/loginuser', $scope.authform).then(function(resp){
            //console.log(resp.data);
           if(resp.data.isLoggedIn == true){
               $scope.resp = resp.data
              /////STORING USER DATA IN COOKIE////////
               $cookieStore.put('userObj', resp);
               console.log($cookieStore.get('userObj'));
               $location.path('/home');
           } else {
               $location.path('/registration');
           }
       });
    };
});

///////////////////////////////MESSAGE CONTROLLER//////////////////////////
app.controller('messageCtrl', function($scope, $http, $location, $cookieStore, $rootScope){
    
    var message = [];
       var userObj = $cookieStore.get('userObj');
       console.log(userObj.data.data.username);
       var obj = {
        user : userObj.data.data.username
        }
       $http.post('http://localhost:3000/messagesave', obj).then(function(resp){
        console.log(resp.data.data);
        $scope.messages = resp.data.data;
        message = $scope.messages;
       });

       $scope.details = function(index){
            $location.path('/msgdetails');
            $rootScope.messages = message[index];
            console.log($rootScope.messages);
       };

});

////////////////////////////////messagedetailsCtrl/////////////////////////////
app.controller('messagedetailsCtrl', function($http, $scope, $location, $rootScope, $cookieStore){

    $scope.GoBack = function(){
        $location.path('/messages');
    };

    var count, id;
    $scope.important = function(){
        //var userObj = $cookieStore.get('userObj');
        count = $rootScope.messages.important;
        id = $rootScope.messages._id;
        count++;
        console.log(count);
        var obj = {
            count: count,
            id : id
        }
        $http.post('http://localhost:3000/important', obj).then(function(resp){
            //console.log(resp);
        });
    };

    var id1;
    $scope.delete = function(){
            //console.log($rootScope.messages._id);
             id1 = $rootScope.messages._id;
           
            var obj = {
                id : id1
            }
            console.log(obj);
            $http.post('http://localhost:3000/deletemsg', obj).then(function(resp){
                console.log(resp);
                alert('deleted successfully');
                $location.path('/messages');
            });
    };

    var replyId;
    $scope.reply = function(v){
           //console.log(v.reply);

           replyId = $rootScope.messages._id;
           var obj = {
               id : replyId,
               reply :  v.reply
           }
           console.log(obj);
           $http.post('http://localhost:3000/reply', obj).then(function(resp){
                console.log(resp.data.data.reply);
                $scope.reply = resp.data.data.reply;
            });

            $scope.re.reply = "";
    };
});



//////////////////////////////HOME CONTROLLER////////////////////////////////////////
app.controller('homeCtrl', function($scope, $location, $cookieStore){
    $scope.profile = function() {
       $location.path('/profile');
    }

   $scope.message = function(){
        $location.path('/messages');
    }

    $scope.logout = function(){
        $location.path('/login');
        $cookieStore.remove("userObj");
    }
});



