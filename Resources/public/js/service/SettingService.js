/*
 * This file is part of the ONGR package.
 *
 * (c) NFQ Technologies UAB <info@nfq.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

angular
    .module('service.setting', [])
    .service('settingService', ['$http',
        function ($http) {

            /**
             * Setting data holder
             *
             * @type {{}}
             */
            this.setting = {
                name:   "name",
                profile: "default",
                description: "-",
                type:   "string",
                data:   {
                    value : "value"
                }
            };

            /**
             * Available setting types
             *
             * @type {[]}
             */
            this.settingTypes = [
                { "type": "string", "name": "Default" },
                { "type": "boolean", "name": "Boolean" },
                { "type": "array", "name": "Array" },
                { "type": "object", "name": "Object" }
            ];

            /**
             * Index for selected setting type button
             *
             * @type {int}
             */
            this.selectedTypeIndex = 0;

            /**
             * Http response status code
             *
             * @type {int}
             */
            this.status = 0;

            /**
             * Setting list that is updated when setting is added
             *
             * @type {settingsList,null}
             */
            this.settingsList = null;

            /**
             * Current profile of the setting list
             */
            this.currentProfile = null;

            /**
             * Data value cache. Used when switching between setting types
             */
            this.dataValueCache = {
                string: '',
                boolean: true,
                array: [],
                object: ''
            };

            /**
             * Changes the type of setting
             *
             * @param $index
             */
            this.changeType = function ($index) {
                var oldType = this.settingTypes[this.selectedTypeIndex].type;
                var newType = this.settingTypes[$index].type;
                this.selectedTypeIndex = $index;
                this.setting.type = newType;
                this.setting.data['value'] = this.loadDataFromCache(newType, oldType);
            };

            /**
             * Loads new value from values cache
             *
             * @param newType
             * @param oldType
             */
            this.loadDataFromCache = function (newType, oldType) {
                this.dataValueCache[oldType] =
                    (oldType == 'object') ? this.getYamlBoxData() : this.setting.data['value'];
                return this.dataValueCache[newType];
            };

            /**
             * Returns Yaml box data if exists
             *
             * @returns {[]|{}}
             */
            this.getYamlBoxData = function () {
                var data;
                var yamlBox = angular.element(document.getElementById('yaml'));
                if (typeof yamlBox[0] === "undefined") {
                    data = '';
                } else {
                    data = jsyaml.safeLoad(yamlBox[0].value);
                }
                return data;
            };

            /**
             * Sets setting data holder values to default
             */
            this.clearValues = function () {
                this.status = 0;
                this.selectedTypeIndex = 0;
                this.setting = {
                    name:   "",
                    profile: "default",
                    description: "",
                    type:   "string",
                    data:   {
                        value : ""
                    }
                };
            };

            /**
             * Sets setting data
             *
             * @param data {{}}
             */
            this.setSetting = function (data) {
                if (typeof data['data'] === 'undefined') {
                    data['data'] = { value : '' };
                }
                if (data.data.value instanceof Object && !Array.isArray(data.data.value)) {
                    data.type = 'object';
                }
                this.setting = data;
            };

            /**
             * Sets settings list to be updated
             *
             * @param settingsList
             */
            this.setSettingsList = function (settingsList) {
                this.settingsList = settingsList;
            };

            /**
             * Sets current profile
             *
             * @param currentProfile
             */
            this.setCurrentProfile = function (currentProfile) {
                this.currentProfile = currentProfile;
            };

            /**
             * Saves new object by sending ajax request
             */
            this.addSetting = function () {

                var requestUrl = Routing.generate('ongr_settings_setting_ng_edit', {
                    name: this.setting.name,
                    profile: this.setting.profile
                });

                if (this.setting.type == 'object') {
                    this.setting.data = {};
                    this.setting.data['value'] = this.getYamlBoxData();
                }

                this.status = 0;
                var _this = this;
                $http({method: "POST", url: requestUrl, data: {setting: this.setting}})
                    .success(function () {
                        _this.status = 200;
                        if (_this.settingsList != null) {
                            var newSetting = angular.copy(_this.setting);
                            if (_this.setting.profile == _this.currentProfile) {
                                _this.settingsList.list.push(newSetting);
                            }
                        }
                    })
                    .error(function () {
                        _this.status = 400;
                    });
            };

            /**
             * Adds new element to array
             */
            this.arrayAdd = function () {

                this.setting.data['value'].push("");

            };

            /**
             * Removes selected element from array
             *
             * @param {int} key
             */
            this.arrayUnset = function (key) {

                this.setting.data['value'].splice(key, 1);

            };

        }
    ]);
