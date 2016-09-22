$(document).ready(function(){function t(t,e){var a="";e&&(a='checked="checked"');var n='<label class="profile-choice"><input type="checkbox" '+a+' name="setting[profile][]" value="'+t+'">'+t+"</label>";$("#profiles-container .checkbox").append(n)}function e(e){$("#profiles-loader").show(),$("#profiles-container .checkbox").html(""),$.post(Routing.generate("ongr_settings_profiles_get_all"),function(a){$("#profiles-loader").hide(),a.forEach(function(a){$.inArray(a,e)>-1?t(a,!0):t(a,!1)})})}var a=$("#settings").DataTable({ajax:{url:Routing.generate("ongr_settings_search_page"),dataSrc:"documents"},stateSave:!0,columns:[{data:"name"},{data:"value"},{data:"description"},{data:"profile"},{}],columnDefs:[{targets:1,render:function(t,e,a){if("bool"==a.type){var n=$("<label/>").addClass("boolean-property btn btn-default").addClass("boolean-property-"+a.id).attr("data-name",a.name),o=n.clone().html("ON").attr("data-element","boolean-property-"+a.id).attr("data-value",1),i=n.clone().html("OFF").attr("data-element","boolean-property-"+a.id).attr("data-value",0);1==a.value?o.addClass("btn-primary"):i.addClass("btn-primary");var r=$("<div/>").addClass("btn-group btn-group-sm").append(o,i);return r.prop("outerHTML")}return t}},{targets:3,orderable:!1},{targets:4,data:null,orderable:!1,render:function(t,e,a){return'<a class="edit btn btn-primary btn-xs" data-toggle="modal" data-target="#setting-edit">Edit</a>&nbsp;<a class="delete delete-setting btn btn-danger btn-xs" data-name="'+a.name+'">Delete</a>'}}]}),n=$("<button/>").html("Add new setting").addClass("btn btn-success btn-sm").attr({id:"new-setting-button"});$("#settings_filter").append(n.prop("outerHTML")),$("#new-setting-button").on("click",function(){$("#profiles-loader").show(),$(".profile-choice").remove(),$("#setting-action-title").text("New setting"),$("#setting-form-modal").modal(),e()}),$("#select-all-profiles").on("click",function(){$('#profiles-container .checkbox input[type="checkbox"]').prop("checked",!0)}),$("#add-new-profile").on("click",function(){t($("#add-new-profile-input").val()),$("#add-new-profile-input").val("")}),$("#add-new-profile-show-form").on("click",function(){$(this).hide(),$("#add-new-profile-container").show(),$("#add-new-profile-input").focus()}),$(".bool-value-input").on("click",function(){$(".bool-value-input").removeClass("btn-primary"),$(this).addClass("btn-primary"),$("#bool-value-input").val($(this).data("value"))}),$("#setting-value-tabs").on("shown.bs.tab",function(t){var e=$(t.target).data("value");$("#setting-type-input").val(e)}),$("#setting-form-modal").on("hide.bs.modal",function(){$("#setting-form-error").hide(),$("#setting-name-input").val(""),$("#setting-description-input").val(""),$("#setting-value-input").val(""),$("#force-update").val("0"),$(".bool-value-input").removeClass("btn-primary"),$(".bool-value-input-0").addClass("btn-primary"),$("#bool-value-input").val("0"),$("#string-value-input").val(""),$("#yaml-value-input").val(""),$("#setting-name-input").removeAttr("disable"),$("input:checkbox").removeAttr("checked")}),$("#setting-form-submit").on("click",function(t){t.preventDefault(),$("#setting-value-input").val($("#"+$("#setting-type-input").val()+"-value-input").val());var e=$("#setting-form").serializeArray();$.ajax({url:Routing.generate("ongr_settings_setting_submit"),data:e,success:function(t){0==t.error?(a.ajax.reload(),$("#setting-form-modal").modal("hide")):($("#setting-form-error-message").html(t.message),$("#setting-form-error").show())}})}),$("#settings tbody").on("click","a.edit",function(){var t=a.row($(this).parents("tr")).data();switch(e(t.profile),$("#setting-action-title").text("Setting edit"),$("#force-update").val("1"),$("#setting-name-input").val(t.name),$("#setting-name-input").attr("disable","disable"),$("#setting-name").val(t.name),$("#setting-description-input").val(t.description),$("#setting-value-input").val(t.value),$("#setting-type-input").val(t.type),$('#setting-value-tabs a[href="#'+t.type+'-value"]').tab("show"),$("#"+t.type+"-value-input").val(t.value),t.type){case"yaml":case"string":break;case"bool":$(".bool-value-input").removeClass("btn-primary"),$(".bool-value-input-"+t.value).addClass("btn-primary")}$("#setting-form-modal").modal()}),$("#settings tbody").on("click","label.boolean-property",function(){var t=$(this);$.post(Routing.generate("ongr_settings_settings_update_value"),{name:t.data("name"),value:t.data("value")},function(){var e=t.data("element");$("."+e).toggleClass("btn-primary")})}),$("#settings tbody").on("click","a.delete-setting",function(t){t.preventDefault();var e=$(this).data("name");$.confirm({text:"Are you sure you want to delete setting?",title:"Confirmation required",confirm:function(t){$.post(Routing.generate("ongr_settings_settings_delete"),{name:e},function(t){0==t.error&&a.ajax.reload()})},confirmButton:"Yes, delete it",cancelButton:"No",confirmButtonClass:"btn-danger",dialogClass:"modal-dialog modal-lg"})});var o=$("#profiles").DataTable({ajax:{url:Routing.generate("ongr_settings_profiles_get_all_detailed"),dataSrc:"documents"},stateSave:!0,order:[[1,"asc"]],columns:[{data:"name"},{data:"name"},{data:"settings"},{}],columnDefs:[{targets:0,orderable:!1,render:function(t,e,a){var n="toggle-profile",o=$("<label/>").addClass("btn btn-default").addClass(n).addClass(n+"-"+a.name).attr("data-name",a.name),i=o.clone().html("ON").attr("data-element",n+"-"+a.name),r=o.clone().html("OFF").attr("data-element",n+"-"+a.name);1==a.active?i.addClass("btn-primary"):r.addClass("btn-primary");var l=$("<div/>").addClass("btn-group btn-group-sm").append(i,r);return l.prop("outerHTML")}},{targets:2,orderable:!1},{targets:3,data:null,orderable:!1,defaultContent:'<a class="copy-link btn btn-primary btn-xs" data-toggle="modal">Copy link</a>&nbsp;'}]});$("#profiles tbody").on("click","label.toggle-profile",function(){var t=$(this);$.post(Routing.generate("ongr_settings_profiles_toggle"),{name:t.data("name")},function(){$(".toggle-profile-"+t.data("name")).toggleClass("btn-primary")})}),$("#profiles tbody").on("click","a.copy-link",function(t){t.preventDefault();var e=o.row($(this).parents("tr")).data(),a=Routing.generate("ongr_settings_enable_profile",{key:e.name},!0);$("#copy-placeholder").text(a);var n=document.createRange(),i=document.querySelector("#copy-placeholder");n.selectNode(i),window.getSelection().addRange(n);try{var r=document.execCommand("copy");if(!r)throw new Error("Cannot copy");noty({text:"Link successfully copied to the clipboard.",type:"success",layout:"topRight",theme:"bootstrapTheme",timeout:10,animation:{open:"animated fadeIn",close:"animated fadeOut"}})}catch(t){noty({text:"Something went wrong..",type:"error",layout:"topRight",theme:"bootstrapTheme",timeout:10,animation:{open:"animated fadeIn",close:"animated fadeOut"}}),$.alert({title:"Here's the link:",content:"<span>"+a+"</span>",confirmButton:"Close"})}})});