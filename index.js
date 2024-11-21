const fs = require('fs');

const filePath = 'sales-data.txt';
let data = fs.readFileSync(filePath, 'utf-8');
data = data.trim().split('\n');

function totalSales(data) {
    const rows = data.slice(1).map(row => {
        const [date, sku, unitPrice, quantity, totalPrice] = row.split(',');
        return {
            date,
            month: date.slice(0, 7),
            sku,
            unitPrice: parseFloat(unitPrice),
            quantity: parseInt(quantity, 10),
            totalPrice: parseFloat(totalPrice)
        };
    });

    const totalStoreSales = rows.reduce((sum, row) => sum + row.totalPrice, 0);

    const monthWiseSales = rows.reduce((acc, row) => {
        acc[row.month] = (acc[row.month] || 0) + row.totalPrice;
        return acc;
    }, {});

    // Most popular item (most quantity sold) in each month
    const mostPopularItems = rows.reduce((acc, row) => {
        if (!acc[row.month]) acc[row.month] = {};
        acc[row.month][row.sku] = (acc[row.month][row.sku] || 0) + row.quantity;
        return acc;
    }, {});

    const mostPopularByMonth = {};
    for (const month in mostPopularItems) {
        const items = mostPopularItems[month];
        mostPopularByMonth[month] = Object.entries(items).reduce((max, [sku, qty]) =>
            qty > max.qty ? { sku, qty } : max, { sku: null, qty: 0 });
    }

    // Items generating most revenue in each month
    const revenueByItems = rows.reduce((acc, row) => {
        if (!acc[row.month]) acc[row.month] = {};
        acc[row.month][row.sku] = (acc[row.month][row.sku] || 0) + row.totalPrice;
        return acc;
    }, {});

    const mostRevenueByMonth = {};
    for (const month in revenueByItems) {
        const items = revenueByItems[month];
        mostRevenueByMonth[month] = Object.entries(items).reduce((max, [sku, revenue]) =>
            revenue > max.revenue ? { sku, revenue } : max, { sku: null, revenue: 0 });
    }

    // For most popular items -> min, max, and average orders
    const statsForMostPopular = {};
    for (const month in mostPopularItems) {
        const sku = mostPopularByMonth[month].sku;
        const quantities = rows
            .filter(row => row.month === month && row.sku === sku)
            .map(row => row.quantity);

        const total = quantities.reduce((sum, qty) => sum + qty, 0);
        const min = Math.min(...quantities);
        const max = Math.max(...quantities);
        const avg = total / quantities.length;

        statsForMostPopular[month] = { sku, min, max, avg };
    }

    return {
        totalStoreSales,
        monthWiseSales,
        mostPopularByMonth,
        mostRevenueByMonth,
        statsForMostPopular
    };
}

const results = totalSales(data);
console.log('Total Sales of the Store:', results.totalStoreSales);
console.log('Month-wise Sales Totals:', results.monthWiseSales);
console.log('Most Popular Item by Month:', results.mostPopularByMonth);
console.log('Most Revenue-Generating Item by Month:', results.mostRevenueByMonth);
console.log('Stats for Most Popular Item:', results.statsForMostPopular);