# Evening Table

A compact, phone-friendly meal planner with favourites, seasonal discoveries, cooking methods, dinner and lunch portions, and a combined shopping list.

## Use

Open the website, choose a start date and three or four dinners, then adjust individual meals using **Change**. Tap a meal name for the recipe. The shopping list combines ingredients across the selected dates and excludes checked items when copied or downloaded.

The recipe collection is included in the website, and published updates appear after reloading. Favourite IDs, recipe edits, meal selections and shopping checkboxes remain in each browser's local storage. They are not synced between household members. No login, payment or Coop account is required to use the planner.

## Recipe data

Starter recipes and quantities are editable drafts, with source links on adapted recipes. Times are estimates. The planner favours chicken, fish and pork on roughly six days of a full week and a vegetarian dinner on one day. Beef and asparagus are excluded. No verified nutrition or live retailer inventory is provided.

`src/weekly-surprises.json` holds the latest featured collection and archives of earlier weekly recipes. Keep recipe IDs stable so saved and planned meals survive updates. Add new ingredients using canonical ingredient IDs so shopping quantities combine correctly.

## Build and check

This project requires only Python 3 to build and Node.js to run the checks; there are no package dependencies.

```sh
python3 scripts/build-site.py
node --check build/meal-bundle.js
node scripts/check-recipes.cjs
```

Publish the generated `index.html` together with updated source files. GitHub Pages serves the root of the `main` branch. `.nojekyll` keeps the generated page unchanged.

The page requests that search engines not index it. This does not restrict access: the site and repository are public.
