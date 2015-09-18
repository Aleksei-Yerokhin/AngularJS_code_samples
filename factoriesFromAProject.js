app.factory('MyPersonal', ['$resource', 'Upload', function($resource, Upload) {

    var MAX_FILE_SIZE = 3500000;

    return {
        profile: $resource('/api/profiles/myprofile/edit', {}, {
            'save_profile': {
                method: 'PUT'
            }
        }),
        resume: $resource('/api/careers/mycv/edit', {}, {
            'save_resume': {
                method: 'PUT'
            }
        }),
        edit_password: $resource('/api/profiles/myprofile/edit_password/'),
        videos: $resource('/api/videos/myvideos'),
        my_categories: $resource('/api/profiles/myprofile/categories/edit', {}, {
            'save_categories': {
                method: 'PUT'
            }
        }),
        categories: $resource('/api/lbb/categories/?parent=:parentId'),
        my_genres: $resource('/api/profiles/myprofile/genres/edit', {}, {
            'save_genres': {
                method: 'PUT'
            }
        }),
        all_genres: $resource('/api/lbb/genres'),
        MAX_FILE_SIZE: MAX_FILE_SIZE
    };
}]);

app.factory('MyProfileUploadAndSave', ['$q', 'Upload', 'MyPersonal', function($q, Upload, MyPersonal){
    return {
        upload_and_save: function(model){
            var personalInfoUpdated = $q.defer();
            if (typeof(model.image) === 'object' && model.image !== null) {
                var file = model.image[0];
                    Upload.upload({
                    url: '/api/profiles/myprofile/edit/',
                    method: 'PUT',
                    file: file,
                    fields: model
                    }).success(function (data, status, headers, config) {
                        personalInfoUpdated.resolve(data);
                    }).error(function (data, status, headers, config){
                        console.debug('ERROR with file!', data);
                        personalInfoUpdated.reject({'data': data, 'status': status });
                    });
            } else {
                delete model['image'];
                MyPersonal.profile.save_profile(model).$promise.then(function(data){
                    personalInfoUpdated.resolve(data);
                },
                function(data){
                    console.debug('Error without file!', data);
                    personalInfoUpdated.reject(data);
                }
                );
            }
            return { $promise: personalInfoUpdated.promise };
        }
    }
}]);

app.factory('MyMessages', ['$resource', function($resource){
    return {
        messages: $resource('/api/messaging/messages/:id/:action/?', {id: '@id'}, {
            get_all: {
                method: 'GET',
                isArray: true
            },
            get_message: {
                method: 'GET',
                isArray: false
            },
            delete_message: {
                params: {action: 'delete_message'},
                method: 'PUT',
                isArray: false
            }
        }),
        send_message: $resource('/api/messaging/send_message/')
    }
}]);

app.factory('MyFollowings', ['$resource', function($resource){
    return $resource('/api/microblogging/followings/?type=:type', {type: '@type'})
}]);