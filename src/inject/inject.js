let QUERY_TYPES = {
  AND: "AND",
  OR: "OR",
};

let opToFn = {
  "does-not-exist": "NOT(EXISTS(__field))",
  exists: "EXISTS(__field)",
  contains: "CONTAINS(__field, __value)",
  "does-not-contain": "NOT(CONTAINS(__field, __value))",
  "starts-with": "STARTS_WITH(__field, __value)",
  "does-not-start-with ": "NOT(STARTS_WITH(__field, __value))",
  "=": "EQUALS(__field, __value)",
  "!=": "NOT(EQUALS(__field, __value))",
  ">": "GT(__field, __value)",
  "<": "LT(__field, __value)",
  ">=": "GTE(__field, __value)",
  "<=": "LTE(__field, __value)",
};

let numericOps = ["=", "!=", ">", "<", ">=", "<="];

let ICON = `
<div class="css-flxm2o-RawButton e1myaoz20">
	<svg xmlns="http://www.w3.org/2000/svg" style="height: 1.5rem; width: 1.5rem; cursor: pointer;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
	<title id="unique-id">Copy WHERE clause as a Derived Column syntax</title>
	<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
	</svg>
</div>`;

function copyToClipboard(queryStr) {
  const el = document.createElement("textarea");
  el.value = queryStr;
  document.body.append(el);

  // Select the text and copy to clipboard
  el.select();
  const success = document.execCommand("copy");
  el.remove();

  if (!success) {
    console.log(`Failed to write to clipboard`);
  }
}

chrome.extension.sendMessage({}, function (response) {
  var readyStateCheckInterval = setInterval(function () {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);

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

      let filters = Array.from(
        queryParts[1].childNodes[0].childNodes.values()
      ).map((item) => item.textContent);

      let filtersObj = Array.from(
        filters.map((f) => {
          let parts = f.split(" ");
          let obj = {
            field: parts[0],
            operator: parts[1],
            value: parts[2],
          };

          return obj;
        })
      );

      let translatedFilters = Array.from(
        filtersObj.map((f) => {
          let s = opToFn[f.operator];
          s = s.replace(`__field`, `\$${f.field}`);
          // value is optional
          if (f.value != undefined) {
            // TODO: if it is a numeric operator then don't wrap with quotes ""
            if (numericOps.includes(f.operator)) {
              s = s.replace(`__value`, `${f.value}`);
            } else {
              s = s.replace(`__value`, `"${f.value}"`);
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

      console.log(`The final query is: ${queryStr}`);

      // find location
      let container = document.querySelector(
        '[data-test="query-builder"]'
      ).nextElementSibling;

      console.log(container);

      const parser = new DOMParser();
      const svg = parser.parseFromString(ICON, "image/svg+xml");

      svg.querySelector("div").addEventListener("click", function (event) {
        copyToClipboard(queryStr);
      });

      svg.querySelector("div").className = "css-flxm2o-RawButton e1myaoz20";

      container.appendChild(svg.querySelector("div"));
      // insert button

      // make it clickable
    }
  }, 10);
});
