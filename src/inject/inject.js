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

const ICON = `
	<svg xmlns="http://www.w3.org/2000/svg" style="height: 1.5rem; width: 1.5rem; cursor: pointer;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
	<title id="unique-id">Copy WHERE clause as Derived Column syntax</title>
	<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
	</svg>`;

function copyToClipboard(queryStr) {
  const el = document.createElement("textarea");
  el.value = queryStr;
  document.body.append(el);

  // Select the text and copy to clipboard
  el.select();
  const success = document.execCommand("copy");
  el.remove();

  if (!success) {
    console.error(`Failed to write to clipboard`);
  }
}

function getQuery() {
  let queryType = QUERY_TYPES.AND;
  // until we figure out a better way of restricting the pages

  let queryParts = document.querySelector(
    '[data-test="filter-clause"]'
  ).childNodes;

  // queryParts[0] -> WHERE
  // queryParts[1] -> filters applied to the query
  if (queryParts[0].childNodes.length > 1) {
    queryType = QUERY_TYPES.OR;
  }

  let filters = Array.from(queryParts[1].childNodes[0].childNodes.values()).map(
    (item) => item.textContent
  );

  console.log(filters);

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

  console.log(
    `We have a query of type ${queryType} with the filters`,
    filtersObj
  );

  return queryStr;
}

chrome.extension.sendMessage({}, function (response) {
  var readyStateCheckInterval = setInterval(function () {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);

      // find location
      let container = document.querySelector(
        '[data-test="query-builder"]'
      ).nextElementSibling;

      container.style.cssText = `display: flex; flex-direction: column; position: relative`;

      let newDiv = document.createElement("div");

      newDiv.addEventListener("click", function (event) {
        let queryStr = getQuery();
        copyToClipboard(queryStr);

        chrome.runtime.sendMessage("", {
          type: "notification",
          options: {
            type: "basic",
            title: "honeycomb.io",
            message: "Copied query to the clipboards!",
            iconUrl: "icons/icon48.png",
          },
        });
      });

      newDiv.style.cssText = `bottom: 40%; position: absolute; width: 100%;`;
      newDiv.innerHTML = ICON;
      container.appendChild(newDiv);
    }
  }, 10);
});
