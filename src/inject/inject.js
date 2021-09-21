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

function getFilters() {
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

  return filters;
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
        let filters = getFilters();
        let queryStr = getQuery(filters);
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

      newDiv.style.cssText = `bottom: 20%; position: absolute; width: 100%;`;
      newDiv.innerHTML = ICON;
      container.appendChild(newDiv);
    }
  }, 10);
});
