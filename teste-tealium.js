function testeTealium(){
    var ctg = "Device Ready";
    var act = "Device Ready";
    var lbl = "Device Ready";
    tealium.track("link", {"event_category" : ctg, "event_action" : act, "event_label" : lbl}, "tealium");
}

document.addEventListener("deviceready", function() {
	$("body").on("change", "input[name='cpfCnpj']", function(){
		var ctg = window.location.href;
		var act = "Preencheu campo";
		var lbl = $.trim($(this).parent().find("label").text());
		tealium.track("link", {"event_category" : ctg, "event_action" : act, "event_label" : lbl}, "tealium");
	});
	var ctg = "Device Ready";
    var act = "Device Ready";
    var lbl = "Device Ready";
    //utag.link({"event_category" : ctg, "event_action" : act, "event_label" : lbl});
    tealium.track("link", {"event_category" : ctg, "event_action" : act, "event_label" : lbl}, "tealium");
}, false);
