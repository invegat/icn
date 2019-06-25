const mysql = require('mysql');
const excel = require('exceljs');

// Create a connection to the database
const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Mco75271|',
    database: 'test'
});

function toXLSX(tableName) {
    // Open the MySQL connection
    con.connect((err) => {
        if (err) throw err;

        // -> Query data from MySQL
        con.query(`SELECT * FROM ${tableName}`, function (err, data, fields) {

            let workbook = new excel.Workbook(); //creating workbook
            let worksheet = workbook.addWorksheet('Customers'); //creating worksheet


            const columns = []
            const date_columns = []
            fields.forEach((item, i) => {
                // console.log(item)
                length = item.type
                if (item.type === 10) {
                    length = 18
                    if (item.name.indexOf('date') >= 0) {
                        date_columns.push(i)
                    }
                }
                columns.push({ header: item.name, key: item.name, width: length })
            }
            );

            worksheet.columns = columns

            // Add Array Rows
            worksheet.addRows(JSON.parse(JSON.stringify(data)));
            date_columns.forEach(i => {
                column = worksheet.getColumn(i + 1)
                column.eachCell((cell, ci) => {
                    if (ci > 1) {
                        // console.log(`cell.value: ${cell.value}`)
                        cell.value = Date.parse(cell.value)
                    }
                })
            })

            // worksheet.getCell('A1').value = new Date(2017, 2, 15);

            // Write to File

            workbook.xlsx.writeFile(`${tableName}.xlsx`)
                .then(function () {
                    console.log("file saved!");
                });

            // -> Close MySQL connection
            con.end(function (err) {
                if (err) {
                    return console.log('error:' + err.message);
                }
                console.log('Close the database connection.');
            });

            // -> Check 'customer.csv' file in root project folder
        });
    });
}
toXLSX('customer')