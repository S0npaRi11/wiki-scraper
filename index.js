const pup = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await pup.launch()
    const page = await browser.newPage()

    await page.goto('https://en.wikipedia.org/wiki/List_of_mango_cultivars',{
        waitUntil: 'networkidle2'
    })

    await page.screenshot({path: 'mangoWiki.png'})

    await page.waitForSelector('table.wikitable')

    const content = await page.$$eval('tbody > tr', rows => {
        return Array.from(rows, row => {
            const col = row.querySelectorAll('td');
            return Array.from(col, c => c.textContent.trim().replace(/['"]+/g, ''))
        })
    })

    console.log(content)

    
    // create a csv file and the first row
    const firstCSVRow = '"Comon Name","Image","Origin/Region","Notes"\n'

    await fs.writeFile('mango-data.csv', firstCSVRow, err => {
        if(err) console.error(err)
    })

    // write data in CSV file
    content.forEach(row => {
        let rowString = ''
        row.forEach(cell => {
            let newCell = cell.replace(/,/g, '","')
            newCell = '"' + cell + '"'
            rowString = rowString + newCell + ',' 
        })

        rowString = rowString + '\n'

        fs.appendFile('mango-data.csv', rowString, err => {
            if(err){
                console.log(err)
                return
            }
         })
    })
   

    await browser.close()
})();

