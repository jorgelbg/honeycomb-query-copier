const assert = require("assert");
const ext = require("../src/translator.js");

let QUERIES = [
  {
    name: "does-not-exist operator",
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
    name: "numeric values are not quoted",
    filters: ["http.method in GET, POST", "duration_ms > 500"],
    translated: `AND(IN($http.method, "GET","POST"),GT($duration_ms, 500))`,
  },
  {
    name: "string values are quoted",
    filters: ["http.method in GET, POST", "service.name contains istio"],
    translated: `AND(IN($http.method, "GET","POST"),CONTAINS($service.name, "istio"))`,
  },
];

describe("Query parser", () => {
  describe("translator", () => {
    QUERIES.forEach((test) => {
      it(test.name, () => {
        assert.equal(ext.getQuery(test.filters), test.translated);
      });
    });
  });

  describe("errors", () => {
    it("throws exception for unknown operators", () => {
      assert.throws(
        () => ext.getQuery([`http.method totally-not-an-operator`]),
        /totally-not-an-operator/
      );
    });
  });
});
