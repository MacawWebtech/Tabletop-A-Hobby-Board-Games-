/* Contact: pre-fill topic and product from the URL (?topic=advice&product=azul). */
(function () {
  "use strict";
  var p = new URLSearchParams(location.search);
  var t = document.getElementById("cTopic"), pr = document.getElementById("cProduct");
  if (t && p.get("topic") && t.querySelector('option[value="' + p.get("topic") + '"]')) t.value = p.get("topic");
  if (pr && p.get("product") && pr.querySelector('option[value="' + p.get("product") + '"]')) pr.value = p.get("product");
})();
