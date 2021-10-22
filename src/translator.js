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

  let filtersObj = Array.from(
    filters.map((filter) => {
      let parts = filter.replace(", ", ",").split(" ");
      return {
        field: parts[0],
        operator: parts[1],
        value: parts.slice(2),
      };
    })
  );

  let translatedFilters = Array.from(
    filtersObj.map((filter) => {
      let s = OPERATORS[filter.operator];
      if (s == undefined) {
        throw new Error(`Unknown operator: ${filter.operator}`);
      }

      s = s.replace(`__field`, `\$${filter.field}`);

      // value is optional
      if (filter.value.length == 1) {
        let quotes = true;
        // TODO: booleans?
        if (NUMERIC_OPS.includes(filter.operator)) {
          quotes = false;
        }

        if (VALUE_OPS.includes(filter.operator)) {
          quotes = isNaN(filter.value);
        }

        if (MULTIPLE_VALUES_OPS.includes(filter.operator)) {
          // transform GET,POST into GET","POST,
          // and set quotes -> true
          filter.value[0] = filter.value[0].replace(",", '","');
          quotes = true;
        }

        if (quotes) {
          s = s.replace(`__value`, `"${filter.value}"`);
        } else {
          s = s.replace(`__value`, `${filter.value}`);
        }
      }

      return s;
    })
  );

  let queryStr = "";
  let expr = translatedFilters.join(",");

  // when we have a single condition, we skip the AND/OR wrapping
  if (filtersObj.length == 1) {
    return expr;
  }

  switch (queryType) {
    case QUERY_TYPES.OR:
      queryStr = `OR(${expr})`;
      break;
    default:
      queryStr = `AND(${expr})`;
      break;
  }

  return queryStr;
}

if (typeof exports !== "undefined") {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      getQuery,
    };
  }
}
