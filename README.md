# 🚧 honeycomb-query-copier

<p align="center">
    <img class="center" src="https://user-images.githubusercontent.com/1291846/133799750-5e09039f-93cc-4c24-98e5-4600db7567d8.png" width="300" alt="honeycomb-query-copier logo"/>
</p>

**honeycomb-query-copier** is an experimental Google Chrome extension that adds a copy button next to the
[Query Builder](https://docs.honeycomb.io/working-with-your-data/queries/) form. Clicking this button
will copy the `WHERE` clauses present in the current query as [Derived Column
Syntax](https://docs.honeycomb.io/working-with-your-data/customizing-your-query/derived-columns/#derived-column-syntax).

Operators are translated from the Query Builder representation into [their functional
equivalent](https://docs.honeycomb.io/working-with-your-data/customizing-your-query/derived-columns/reference/#function-reference----omit-in-toc---).
Keep in mind that there are advanced functions/operators that cannot be used from the query builder but can be part
of a Derived Column definition. Those especial cases (like `CONCAT`) would still need to be added
using the provided editor when creating/editing the Derived Column.

A query like this in the Query Builder:

```js
meta.annotation_type does-not-exist
trace.parent_id does-not-exist
http.method in GET, POST
```

gets transformed into:

```js
AND(NOT(EXISTS($meta.annotation_type)),NOT(EXISTS($trace.parent_id)),
IN($http.method, "GET","POST"))
```

which can be pasted into the Derived Column editor.

## Installation

⚠️ The extension is currently not published in the Chrome Web Store.

1. Go to `chrome://extensions/`
1. Enable Developer mode

   ![enable developer mode](https://user-images.githubusercontent.com/1291846/138667478-3de4ecfe-0c9a-45f5-aabb-2109cbcfec58.png)
3. Download the `.crx` file from the [Releases
   page](https://github.com/jorgelbg/honeycomb-query-copier/releases).
4. Drag and drop the `.crx` file into the extensions page.

## 🔗 Links

Logo based on the Honeycomb SVG Vector from: https://www.svgrepo.com/svg/227140/honeycomb.