/*
 *************************************************************************
 * NFQ eXtremes CONFIDENTIAL
 * [2013] - [2014] NFQ eXtremes UAB
 * All Rights Reserved.
 *************************************************************************
 * NOTICE:
 * All information contained herein is, and remains the property of NFQ eXtremes UAB.
 * Dissemination of this information or reproduction of this material is strictly forbidden
 * unless prior written permission is obtained from NFQ eXtremes UAB.
 *************************************************************************
 */

angular
    .module('fox.edit', [
        'ui.bootstrap',
        'controller.edit',
        'directive.yaml',
        'service.setting'
    ])
    .constant('DATA', setting)
    .run(['$templateCache', function($templateCache) {
        $templateCache.put('yaml.textarea', '<textarea id="yaml" class="form-control" cols="30" rows="12"></textarea>');
    }]);
