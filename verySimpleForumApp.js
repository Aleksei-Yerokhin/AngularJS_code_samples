

var app = angular.module('forumApp', ['ngResource']);

app.config(['$httpProvider', function($httpProvider){
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    }]).
    factory('api', function($resource){
        function add_auth_header(data, headersGetter){

            var headers = headersGetter();
            headers['Authorization'] = ('Basic ' + btoa(data.username +
                                        ':' + data.password));
        }
        return {
            auth: $resource('/api/auth\\/', {}, {
                login: {method: 'POST', transformRequest: add_auth_header},
                logout: {method: 'DELETE'}
            }),
            users: $resource('/api/users\\/', {}, {
                create: {method: 'POST'}
            })
        };
    }).
    controller('authController', function($scope, api, $rootScope) {

        $('#id_auth_form input').checkAndTriggerAutoFillEvent();

        $scope.getCredentials = function(){
            return {username: $scope.username, password: $scope.password};
        };
 
        $scope.login = function(){
            api.auth.login($scope.getCredentials()).
                $promise.
                    then(function(data){
                        // on good username and password
                        $scope.user = data.username;
                        $scope.auth_error_message = undefined;
                    }).
                    catch(function(data){
                        // on incorrect username and password
                        // alert(data.data.detail);
                        $scope.auth_error_message = data.data.detail;
                    });
        };
 
        $scope.logout = function(){
            api.auth.logout(function(){
                $scope.user = undefined;
                $scope.username = undefined;
                $scope.password = undefined;
            });
        };
    });

app.controller('TopicListController', ['$http', function($http){
    var topics = this;

    topics.topic_list = [];
    $http.get('/api/topics').success(function(data){
        topics.topic_list = data;
    });
}]);

app.controller('TopicStartController', function($scope, $http){
    $scope.create_topic = function(){
        topicstart = $scope.topicstart;
        $http.post('/api/topics', {'name': topicstart.topic_name, 'op_post': topicstart.op_post}).success(function(data){
            var x = data;
            window.location.replace('/topics/'+data.id);
        });
        $scope.topicstart.topic_name = undefined;
        $scope.topicstart.op_post = undefined;
    };
});

app.controller('TopicController', function($scope, $http){
    $scope.get_topic_data = function(t_id){
        $http.get('/api/topics/'+t_id).success(function(data){
        $scope.topic_name = data.name;
        $scope.op_post = data.op_post;

        $scope.posts = [];
        var posts_arr = [];
        for (var x in data.post_set){
            $http.get(data.post_set[x]).success(function(post){
                posts_arr.push(post);
                }).finally(function(){
                    posts_arr = posts_arr.sort(function(a,b){
                            return (a.number_in_topic > b.number_in_topic) ? 1 : ((b.number_in_topic > a.number_in_topic) ? -1 : 0);
                         });
                    $scope.posts = posts_arr;
                })
            }
        });
    };
    $scope.submit_post = function(t_id){
        current_topic = $scope.topic;
        $http.post('/api/posts', {'topic': "/api/topics/" + t_id, 'text': current_topic.new_post}).success(function(data){
            $scope.topic.new_post = undefined;
            $scope.posts.push(data);
        }).error(function(data){
                console.log(data);
        })
    };
});

