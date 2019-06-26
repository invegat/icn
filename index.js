/**  const mysql = require('mysql'); */
const { Client } = require('pg')
const excel = require('exceljs');
// postgres://juwwvohcorbolo:ce3d8c3e671044f8e15c880db71ce26146826e3f126da53a55788f7f0a7a54ae@ec2-23-23-173-30.compute-1.amazonaws.com:5432/d4l0sqaog7kpe0
// Create a connection to the database

const client = new Client({
    user: 'juwwvohcorbolo',
    host: 'ec2-23-23-173-30.compute-1.amazonaws.com',
    database: 'd4l0sqaog7kpe0',
    password: 'ce3d8c3e671044f8e15c880db71ce26146826e3f126da53a55788f7f0a7a54ae',
    port: 5432,
    ssl: true
})


function toXLSX(tableName) {
    // Open the MySQL connection
    client.connect((err) => {
        if (err) throw err;
    })

    // -> Query data from Postgresql
    client.query(`SELECT * FROM ${tableName}`, function (err, res) {

        r = JSON.parse(JSON.stringify(res))
        // console.log(r)
        fields = r.fields

        let workbook = new excel.Workbook(); //creating workbook
        let worksheet = workbook.addWorksheet('Customers'); //creating worksheet

        const max_lengths = {}
        fields.forEach((item, __) => {max_lengths[item.name] = 0});
        r.rows.forEach(row => {
            // console.log('row', row)
            for(const key in max_lengths) {
                if (row[key].length > max_lengths[key]) {
                    max_lengths[key] = row[key].length 
                }
            }
        })
        // console.log('max_lengths', max_lengths)

        const columns = []
        const date_columns = []
        fields.forEach((item, i) => {
            // console.log(item)
            length = max_lengths[item.name] + 1

            if (length < 5) {
                length = item.dataTypeSize === -1 ? item.dataTypeModifier : item.dataTypeSize;
            }
            // console.log('item.name', item.name,'length', length)

            if (length ===  25) {
                if (item.name.indexOf('date') >= 0) {
                    length = 18
                    date_columns.push(i)
                }
            }
            columns.push({ header: item.name, key: item.name, width: length })
        });
        // console.log('date_columns', date_columns)

        worksheet.columns = columns
        r.rows.sort(function(a, b){return a.id - b.id});

        // Add Array Rows
        worksheet.addRows(r.rows);
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
        client.end(function (err) {
            if (err) {
                return console.log('error:' + err.message);
            }
            console.log('Close the database connection.');
        });

        // -> Check 'customer.csv' file in root project folder
    });
    //     });
}
toXLSX('customer')