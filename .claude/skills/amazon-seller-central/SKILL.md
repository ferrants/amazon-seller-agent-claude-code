---
description: Guide for analyzing Amazon Seller Central and Vendor Central data. Use when working with inventory health, FBA fees, sales trends, search query performance, reorder planning, or Vendor Central metrics like vendor sales, net PPM, and demand forecasting.
---

# Amazon Seller Central & Vendor Central Insights Guide

Use the `ask_selling_partner_report_analyst` tool to query Selling Partner report data. Frame questions in natural language with specific date ranges and metrics — the analyst handles the SQL.

## Seller Central

### Inventory Health

- **Days of supply** — How many days will my current stock last at my current sales rate? Which SKUs are running low?
- **Stockout risk** — Which products are at risk of stocking out in the next 7/14/30 days? (Provide your lead time for more accurate results.)
- **Sell-through rate** — Which products are selling well vs. sitting in the warehouse?
- **Inbound pipeline** — What inventory is currently in transit to FBA? How much is being received?
- **Overstocked items** — Which SKUs have more than 90 days of supply and may be incurring excess storage fees?

### Reorder Planning

- **Reorder points** — When should I reorder each SKU? (You'll need to provide your lead time — how long from placing a PO to FBA check-in.)
- **Safety stock** — How much buffer inventory should I keep for each product?
- **Order quantity** — What's the optimal order size to balance ordering costs vs. holding costs? (You'll need to provide your cost per PO.)

> **Note:** Reorder planning requires inputs only you know — lead times, ordering costs, and desired service level. The analyst will ask you for these.

### Fee Analysis

- **FBA fee breakdown** — What are my estimated fees per SKU? Which products have the highest fees?
- **Estimated vs. actual fees** — How do Amazon's estimated fees compare to what I was actually charged in settlements?
- **Fee-to-revenue ratio** — What percentage of my revenue goes to Amazon fees? Which SKUs are barely profitable?
- **Refunds & reimbursements** — How much am I losing to refunds? What has Amazon reimbursed?

### Sales & Traffic

- **Top SKUs by revenue** — What are my best sellers?
- **Daily sales trends** — How are my sales trending over the last 30/60/90 days?
- **Conversion rate by ASIN** — Which products convert well and which don't? Any sudden drops?
- **Buy box health** — Which ASINs have low buy box percentage? What might be causing it?

### Search & Discovery

- **Top search terms** — Which search terms drive the most clicks and conversions for my products?
- **Search query funnel** — Where am I losing customers in the search -> click -> cart -> purchase funnel?
- **Market basket** — What products are frequently bought together with mine? (Cross-sell opportunities.)
- **Repeat purchase rate** — Which products have the most loyal customers?

### Cross-Report Insights

These combine data from multiple reports for deeper analysis:

- **High-converting search terms + low stock** — Products customers are actively finding and buying, but that are running low. Urgent reorder signal.
- **Repeat purchase + stockout risk** — Products with loyal repeat buyers that are at risk of stocking out. Losing a repeat customer is more costly than losing a first-time buyer.
- **Fee burden on top sellers** — Are my best-selling products also my most profitable after fees?
- **Slow movers with high fees** — Products with low sell-through and high fee-to-revenue ratio. Candidates for price adjustment or discontinuation.

## Vendor Central

### Vendor Sales (`sp_vendor_sales`)

- **Ordered vs shipped** — What are my ordered units and shipped units by ASIN? Where is there a gap between what Amazon ordered and what was shipped?
- **Revenue trends** — How is my ordered revenue trending over the last 30/60/90 days? Which ASINs are growing or declining?
- **COGS analysis** — What are my cost of goods sold by ASIN? Which products have the highest COGS relative to revenue?
- **Customer returns** — Which ASINs have the highest return rates? Are returns increasing?

### Vendor Inventory Health (`sp_vendor_inventory`)

- **Sellable on-hand** — How many sellable units does Amazon have on hand for each of my ASINs?
- **Weeks of cover** — Which ASINs have low weeks of cover and may stock out soon?
- **Aged inventory** — Which ASINs have excess or aged inventory sitting in Amazon's warehouses?
- **Open purchase orders** — What purchase order units are outstanding?

### Vendor Traffic (`sp_vendor_traffic`)

- **Glance views** — Which ASINs are getting the most detail page views? Any sudden drops?
- **Buy box percentage** — Which ASINs have low buy box percentage? This affects visibility and sales.
- **Traffic trends** — How are my glance views trending? Any seasonal patterns?

### Vendor Forecasting (`sp_vendor_forecasting`)

- **Demand forecast** — What is Amazon's predicted demand for my products by ASIN and week?
- **Forecast vs actuals** — How does the forecast compare to actual ordered units?

### Vendor Net PPM (`sp_vendor_net_ppm`)

- **Profitability by ASIN** — What is my net pure product margin by ASIN after all costs?
- **Cost breakdown** — Revenue minus COGS, shipping costs, and other costs — where am I losing margin?
- **Margin trends** — Is my overall net PPM improving or declining over time?

### Vendor Cross-Report Insights

- **Low stock + high traffic** — ASINs with low weeks of cover but high glance views. Urgent replenishment signal.
- **High returns + declining margin** — ASINs where returns are eating into profitability.
- **Forecast gap** — ASINs where Amazon's forecast exceeds current sellable on-hand inventory.

> **Note:** Vendor and Seller reports must be downloaded before data is available. If the analyst says no reports are available, reports may still be processing or may need to be triggered.
