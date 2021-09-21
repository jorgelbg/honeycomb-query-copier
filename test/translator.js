const assert = require("assert");
const ext = require("../src/translator.js");

let QUERIES = [
  {
    name: "does-not-exist",
    filters: [
      "meta.annotation_type does-not-exist",
      "trace.parent_id does-not-exist",
    ],
    translated: `AND(NOT(EXISTS($meta.annotation_type)),NOT(EXISTS($trace.parent_id)))`,
  },
  {
    name: "in operator",
    filters: ["http.method in GET, POST"],
    translated: `AND(IN($http.method, "GET","POST"))`,
  },
  {
    name: "numeric operator",
    filters: ["http.method in GET, POST", "duration_ms > 500"],
    translated: `AND(IN($http.method, "GET","POST"),GT($duration_ms, 500))`,
  },
  {
    name: "string values",
    filters: ["http.method in GET, POST", "service.name contains istio"],
    translated: `AND(IN($http.method, "GET","POST"),CONTAINS($service.name, "istio"))`,
  },
];

describe("Query parser", function () {
  describe("translator", function () {
    QUERIES.forEach((test) => {
      it(test.name, function () {
        assert.equal(ext.getQuery(test.filters), test.translated);
      });
    });
  });
});
