var sources={};
var object_count = 0;

function shareEvent(e) {
  Ti.API.error(JSON.stringify(e));
  if (e.source.event_manual) {
    e.source.event_manual = null;
  } else {
    Ti.API.error("Fire");
    Ti.App.fireEvent("tishadow:event", {event: {event_id: e.source.event_id, type: e.type}});
  }
}

exports.reset = function() {
  sources = {};
  object_count = 0;
};

exports.addEventListener=function(source,event,fn) {
  if (source.event_id === undefined) {
    object_count++;
    sources[object_count] = source;
    source.event_id = object_count;
  }
  source.addEventListener(event, fn);
  source.addEventListener(event, shareEvent);
};

exports.removeEventListener=function(source,event,fn) {
  delete sources[source.event_id];
  source.removeEventListener(event, fn);
  source.removeEventListener(event, shareEvent);
};

Ti.App.addEventListener("tishadow:fireEvent", function(e) {
  sources[e.event.event_id].event_manual = true;
  sources[e.event.event_id].fireEvent(e.event.type);
});
