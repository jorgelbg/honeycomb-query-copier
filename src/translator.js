let QUERY_TYPES = {
  AND: "AND",
  OR: "OR",
};

let OPERATORS = {
  "does-not-exist": "NOT(EXISTS(__field))",
  exists: "EXISTS(__field)",
  contains: "CONTAINS(__field, __value)",
  "does-not-contain": "NOT(CONTAINS(__field, __value))",
  "starts-with": "STARTS_WITH(__field, __value)",
  "does-not-start-with ": "NOT(STARTS_WITH(__field, __value))",
  in: "IN(__field, __value)",
  "not-in": "NOT(IN(__field, __value))",
  "=": "EQUALS(__field, __value)",
  "!=": "NOT(EQUALS(__field, __value))",
  ">": "GT(__field, __value)",
  "<": "LT(__field, __value)",
  ">=": "GTE(__field, __value)",
  "<=": "LTE(__field, __value)",
};

let NUMERIC_OPS = [">", "<", ">=", "<="];
let VALUE_OPS = ["=", "!="];
let MULTIPLE_VALUES_OPS = ["in", "not-in"];

function getQuery(filters) {
  let queryType = QUERY_TYPES.AND;
  // console.log(filters);

  let filtersObj = Array.from(
    filters.map((f) => {
      let parts = f.replace(", ", ",").split(" ");
      let obj = {
        field: parts[0],
        operator: parts[1],
        value: parts.slice(2),
      };

      return obj;
    })
  );

  let translatedFilters = Array.from(
    filtersObj.map((f) => {
      let s = OPERATORS[f.operator];
      if (s == undefined) {
        throw `Unknown operator: ${f.operator}`;
      }

      s = s.replace(`__field`, `\$${f.field}`);

      // value is optional
      if (f.value.length == 1) {
        let quotes = true;
        // TODO: booleans?
        if (NUMERIC_OPS.includes(f.operator)) {
          quotes = false;
        }

        if (VALUE_OPS.includes(f.operator)) {
          quotes = isNaN(f.value);
        }

        if (MULTIPLE_VALUES_OPS.includes(f.operator)) {
          // transform GET,POST into GET","POST,
          // and set quotes -> true
          f.value[0] = f.value[0].replace(",", '","');
          quotes = true;
        }

        if (quotes) {
          s = s.replace(`__value`, `"${f.value}"`);
        } else {
          s = s.replace(`__value`, `${f.value}`);
        }
      }

      return s;
    })
  );

  let queryStr = "";
  let expr = translatedFilters.join(",");
  if (queryType == QUERY_TYPES.AND) {
    // combine with `AND()` all the translatedFilters
    queryStr = `AND(${expr})`;
  } else {
    queryStr = `OR(${expr})`;
  }

  // console.log(
  //   `We have a query of type ${queryType} with the filters`,
  //   filtersObj
  // );

  return queryStr;
}

if (typeof exports !== "undefined") {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      getQuery,
    };
  }
}
