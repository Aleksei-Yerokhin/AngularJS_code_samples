(function () {
    angular
        .module('BuyNow.PartsbaseSystemAdmin')
        .controller('PbSystemAdminSystemTasksSchedulingCtrl', PbSystemAdminSystemTasksSchedulingCtrl);

    function PbSystemAdminSystemTasksSchedulingCtrl(initData, _, PbSystemAdminSvc, $scope) {
        var vm = this;

        $scope.$on('$stateChangeStart', function () {
            vm.inProgress = true;
        });

        vm.inProgress = false;

        vm.taskChanged = taskChanged;
        vm.cleanSchedules = cleanSchedules;
        vm.addNewSchedule = addNewSchedule;
        vm.editSchedule = editSchedule;
        vm.updateOrCreateSchedule = updateOrCreateSchedule;
        vm.deleteExistingSchedule = deleteExistingSchedule;

        vm.tasks = initData.systemTasks;
        vm.frequencies = initData.frequencies;
        vm.tasksFrequencies = initData.tasksFrequencies;

        vm.timePickerOptions = {
            format: "HH:mm:ss",
            interval: 10
        };

        _.each(vm.tasksFrequencies, function (taskFrequencyObj) {
            var freqObjReturned = _.find(vm.frequencies, function (freqObj) {
                return taskFrequencyObj.frequency === freqObj.id;
            });
            taskFrequencyObj.freqName = freqObjReturned.name;

            var taskObjReturned = _.find(vm.tasks, function (taskObj) {
                return taskFrequencyObj.systemTaskId === taskObj.id
            });
            taskFrequencyObj.processCategory = taskObjReturned.processCategory;
            taskFrequencyObj.processType = taskObjReturned.processType;
        });

        function cleanSchedules() {
            vm.newSchedule = undefined;
            vm.currentScheduleToEdit = undefined;
        }

        function editSchedule(schedule) {
            vm.newSchedule = undefined;
            vm.currentScheduleToEdit = angular.copy(schedule);
        }

        function addNewSchedule() {
            vm.newSchedule = true;
            vm.currentScheduleToEdit = {};
            vm.currentScheduleToEdit.dayTimeStart = "00:00:00"
        }

        function updateOrCreateSchedule() {
            vm.inProgress = true;
            var dataToSubmit = angular.copy(vm.currentScheduleToEdit);

            if (vm.newSchedule) {
                PbSystemAdminSvc.createSchedule(dataToSubmit.systemTaskId, dataToSubmit)
                    .then(function (res) {
                        res.freqName = _findFreqName(res);
                        vm.tasksFrequencies.push(res);
                        vm.currentScheduleToEdit = undefined;
                        vm.inProgress = false;
                    }).catch(function (err) {
                        vm.inProgress = false;
                    })
            } else {
                PbSystemAdminSvc.updateSchedule(dataToSubmit.systemTaskId, dataToSubmit.id, dataToSubmit).then(function (res) {
                    var oldSchedule = _.find(vm.tasksFrequencies, function (freqObj) {
                        return dataToSubmit.id === freqObj.id;
                    });
                    dataToSubmit.freqName = _findFreqName(dataToSubmit);
                    var indexOfOldSchedule = vm.tasksFrequencies.indexOf(oldSchedule);
                    vm.tasksFrequencies[indexOfOldSchedule] = dataToSubmit;
                    vm.currentScheduleToEdit = undefined;
                    vm.inProgress = false;
                }).catch(function (err) {
                    vm.inProgress = false;
                })
            }
        }

        function deleteExistingSchedule(scheduleId) {
            vm.inProgress = true;

            PbSystemAdminSvc.deleteSchedule(scheduleId)
                .then(function () {
                    vm.tasksFrequencies = _.without(vm.tasksFrequencies, _.findWhere(vm.tasksFrequencies, {id: scheduleId}));
                    vm.inProgress = false;
                }).catch(function (err) {
                    vm.inProgress = false;
                })
        }

        function taskChanged() {
            vm.currentScheduleToEdit.processCategory = _.find(vm.tasks, function (taskObj) {
                return taskObj.id === parseInt(vm.currentScheduleToEdit.systemTaskId);
            }).processCategory;
            vm.currentScheduleToEdit.processType = _.find(vm.tasks, function (taskObj) {
                return taskObj.id === parseInt(vm.currentScheduleToEdit.systemTaskId);
            }).processType;
        }

        function _findFreqName(data) {
            return _.find(vm.frequencies, function (freqObj) {
                return freqObj.id === parseInt(data.frequency);
            }).name;
        }
    }
})();