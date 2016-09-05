$(document).ready(function () {
    var table = $('#settings').DataTable( {
        ajax: {
            url: Routing.generate('ongr_settings_search_page'),
            dataSrc: 'documents'
        },
        stateSave: true,
        columns: [
            { data: 'name' },
            { data: 'value' },
            { data: 'description' },
            { data: 'profile' },
            {}
        ],
        columnDefs: [
            {
                "targets": 1,
                "render": function ( data, type, row ) {
                    if (row['type'] == 'bool') {
                        var label = $('<label/>').addClass('boolean-property btn btn-default')
                            .addClass('boolean-property-' + row['id']).attr('data-name', row['name']);
                        var on = label.clone().html('ON').attr('data-element', 'boolean-property-' + row['id'])
                            .attr('data-value', 1);
                        var off = label.clone().html('OFF').attr('data-element', 'boolean-property-' + row['id'])
                            .attr('data-value', 0);

                        if (row['value'] == true) {
                            on.addClass('btn-primary');
                        } else {
                            off.addClass('btn-primary');
                        }

                        var cell = $('<div/>').addClass('btn-group btn-group-sm').append(on, off);
                        return cell.prop('outerHTML');

                    } else {
                        return data;
                    }
                }
            },
            {
                "targets": 3,
                "orderable": false,
            },
            {
                "targets": 4,
                "data": null,
                "orderable": false,
                "render": function ( data, type, row ) {
                    return '<a class="edit btn btn-primary btn-xs" data-toggle="modal" data-target="#setting-edit">Edit</a>&nbsp;<a class="delete delete-setting btn btn-danger btn-xs" data-name="'+row['name']+'">Delete</a>'
                }
            } ]
    } );

    var newSettingButton = $('<button/>').html('Add new setting').addClass('btn btn-success btn-sm').attr(
        {
            'id': 'new-setting-button',
        }
    );
    $('#settings_filter').append(newSettingButton.prop('outerHTML'));

    function appendNewProfile(element, check) {
        var checked = '';
        if (check) {
            checked = 'checked="checked"';
        }
        var input = '<label class="profile-choice"><input type="checkbox" '+checked+' name="setting[profile][]" value="'+element+'">'+element+'</label>';
        $('#profiles-container .checkbox').append(input);
    }

    function reloadProfiles(select) {
        $('#profiles-loader').show();
        $('#profiles-container .checkbox').html('');
        $.post(Routing.generate('ongr_settings_profiles_get_all'), function (data) {
            $('#profiles-loader').hide();
            data.forEach(function (element) {
                if ($.inArray(element, select) >  -1) {
                    appendNewProfile(element, true);
                } else {
                    appendNewProfile(element, false);
                }
            });
        })
    }

    $('#new-setting-button').on('click', function(){
        $('#profiles-loader').show();
        $('.profile-choice').remove();
        $('#setting-action-title').text('New setting');
        $('#setting-form-modal').modal();
        reloadProfiles();
    });

    $('#select-all-profiles').on('click', function(){
        $('#profiles-container .checkbox input[type="checkbox"]').prop('checked',true);
    });

    $('#add-new-profile').on('click', function(){
        appendNewProfile($('#add-new-profile-input').val());
        $('#add-new-profile-input').val('');
    });

    $('#add-new-profile-show-form').on('click', function () {
        $(this).hide();
        $('#add-new-profile-container').show();
        $('#add-new-profile-input').focus();
    });

    $('.bool-value-input').on('click', function () {
        $('.bool-value-input').removeClass('btn-primary');
        $(this).addClass('btn-primary');
        $('#bool-value-input').val($(this).data('value'));
    });

    $('#setting-value-tabs').on('shown.bs.tab', function (e) {
        var type = $(e.target).data('value');
        $('#setting-type-input').val(type);
    });

    $('#setting-form-modal').on('hide.bs.modal', function () {
        $('#setting-form-error').hide();
        $('#setting-name-input').val('');
        $('#setting-description-input').val('');
        $('#setting-value-input').val('');
        $('#force-update').val('0');
        $('.bool-value-input').removeClass('btn-primary');
        $('.bool-value-input-0').addClass('btn-primary');
        $('#bool-value-input').val('0');
        $('#string-value-input').val('');
        $('#yaml-value-input').val('');
        $('#setting-name-input').removeAttr('disable');
        $('input:checkbox').removeAttr('checked');
    });

    $('#setting-form-submit').on('click', function (e) {
        e.preventDefault();
        $('#setting-value-input').val($('#'+ $('#setting-type-input').val() +'-value-input').val());
        var data = $('#setting-form').serializeArray();
        $.ajax({
            url: Routing.generate('ongr_settings_setting_submit'),
            data: data,
            success: function (response) {
                if (response.error == false) {
                    table.ajax.reload();
                    $('#setting-form-modal').modal('hide')
                } else {
                    $('#setting-form-error').show();
                    $('#setting-form-error-message').html(response.message);
                }
            }
        });
    });

    $('#settings tbody').on( 'click', 'a.edit', function () {
        var data = table.row( $(this).parents('tr') ).data();
        reloadProfiles(data.profile);
        $('#setting-action-title').text('Setting edit');
        $('#force-update').val('1');
        $('#setting-name-input').val(data.name);
        $('#setting-name-input').attr('disable','disable');
        $('#setting-name').val(data.name);
        $('#setting-description-input').val(data.description);
        $('#setting-value-input').val(data.value);
        $('#setting-type-input').val(data.type);
        $('#setting-value-tabs a[href="#'+data.type+'-value"]').tab('show');
        $('#'+data.type+'-value-input').val(data.value);
        switch (data.type) {
            case 'yaml':
            case 'string':
                //Do something if necessary
                break;
            case 'bool':
                $('.bool-value-input').removeClass('btn-primary');
                $('.bool-value-input-'+data.value).addClass('btn-primary');
                break;
        }

        $('#setting-form-modal').modal();
    } );

    $('#settings tbody').on( 'click', 'label.boolean-property', function () {
        var self = $(this);
        $.post(Routing.generate('ongr_settings_settings_update_value'), {name:self.data('name'), value:self.data('value')}, function(){
            var element = self.data('element');
            $("." + element).toggleClass('btn-primary');
        })
    } );

    $('#settings tbody').on( 'click', 'a.delete-setting', function (e) {
        e.preventDefault();

        var name = $(this).data('name');
        $.confirm({
            text: "Are you sure you want to delete "+name+" setting?",
            title: "Confirmation required",
            confirm: function(button) {
                $.post(Routing.generate('ongr_settings_settings_delete'), {name: name}, function(data) {
                    if (data.error == false) {
                        table.ajax.reload();
                    }
                });
            },
            confirmButton: "Yes, delete it",
            cancelButton: "No",
            confirmButtonClass: "btn-danger",
            dialogClass: "modal-dialog modal-lg"
        });
    });
});