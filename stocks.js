const puppeteer = require('puppeteer-extra');
const {performance} = require('perf_hooks');

// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// Add adblocker plugin, which will transparently block ads in all pages you
// create using puppeteer.
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(AdblockerPlugin({blockTrackers: true}));

const pdfDocument = require('pdfkit');

const fs = require("fs");


(async function () {
    try{
        const browser = await puppeteer.launch({
            headless: false,
            slowMo: 90,
            defaultViewport: null,
            args: ["--start-maximized"]
        });
        const page1 = await browser.newPage();
        await page1.goto(
            'https://www.moneycontrol.com/'
            , { waitUntil: 'domcontentloaded' });
    
        await page1.evaluate(function () {
            window.scrollBy(0, window.innerHeight);
        });
    
        await page1.waitForSelector("#indices_price span a");
    
        await Promise.all([
            page1.click('#indices_price span a'),
            page1.waitForNavigation(),
        ]);
    
        await page1.evaluate(function () {
            window.scrollBy(0, window.innerHeight);
        });
    
        await page1.waitForSelector(".bold-text.lightblue-row.indices_list.active1 td");
        await page1.waitForSelector("#sp_asOnDate");
    
    
        let data1 = await page1.evaluate(function () {
            let niftyDate = "\n\nNifty Date: " + document.querySelectorAll("#sp_asOnDate")[0].innerText + ",";
            let niftyPrice = "Nifty Price: " + document.querySelectorAll(".bold-text.lightblue-row.indices_list.active1 td")[1].innerText + ",";
            let niftyOverView = []
            for (let i = 0; i <= 2; i++) {
                niftyOverView.push(document.querySelectorAll(".clearfix .FL.overvtabl td")[i].innerText.replaceAll('\n', ': '))
            }
            niftyOverView.push(document.querySelectorAll(".clearfix .FR.overvtabl td")[0].innerText.replaceAll('\n', ': '))
    
            return niftyDate + "\n" + niftyPrice + "\n" + "Overview: "  + "\n" + niftyOverView + "\n";
    
        });

        // Create a document
        const doc = new pdfDocument();

       //save the pdf file in root directory
        doc.pipe(fs.createWriteStream('stockReport.pdf'));

        // Embed a font, set the font size, and render some text
        doc
        .fontSize(18)
        .text("MARKET REPORT" + '\n' + '\n' + data1, 100, 100);


    
        await page1.mouse.wheel({ deltaY: -800 });
    
        await page1.waitForSelector(".clearfix.navlist_sub");
    
        let indicesLink = await page1.evaluate(function () {
            let li = document.querySelectorAll(".menu_l2 ")[1];
            let anchorTag = li.querySelector("a");
            let indicesLink = anchorTag.getAttribute("href");
            return indicesLink;
        });
    
        await page1.goto(indicesLink, { waitUntil: 'networkidle2', timeout: 0});
    
        await page1.evaluate(function () {
            window.scrollBy(0, 1700);
        });
    
        await page1.waitForSelector(".acord_title.collapsed");
        await page1.click('.acord_title.collapsed');
    
        await page1.mouse.wheel({ deltaY: -1300 });
    
        await page1.waitForSelector("#list_9");
    
        await Promise.all([
            page1.click('#list_9'),
            page1.waitForNavigation(),
        ]);
    
        await page1.screenshot({ path: 'data2.png' });

        // Add doc2.png, constrain it to a given size, and center it vertically and horizontally
        doc.image('data2.png', {
            fit: [450, 500],
            align: 'center',
            valign: 'center'
            });
    
        await page1.waitForSelector(".responsive tr td p a");
    
        let stockLink = await page1.evaluate(function () {
            let table = document.querySelectorAll(".responsive tr td p")[4];
            let anchorTag = table.querySelector("a");
            let stockLink = anchorTag.getAttribute("href");
            return stockLink;
        });
    
        await page1.goto(stockLink, { waitUntil: 'networkidle2', timeout: 0 });
    
    
        await page1.evaluate(function () {
            window.scrollBy(0, 600);
        });
    
        let data3 = await page1.evaluate(function () {
            let stockDate = "Stock Date: " + document.querySelectorAll(".nseasondate")[0].innerText + ",";
            let stockName = "Stock Name: " + document.querySelectorAll('#stockName h1')[0].innerText + ",";
            let stockPrice = "Stock Price: " + document.querySelectorAll(".pcstkspr.nsestkcp.bsestkcp.futstkcp.optstkcp")[0].innerText + ",";
            let stockOverView = [];
            for (let i = 0; i <= 1; i++) {
                stockOverView.push(document.querySelectorAll(".oview_table tr ")[i].innerText.replaceAll('\t', ': '))
            }
            stockOverView.push("Day High: " + document.querySelectorAll(".FL.nseLP")[0].innerText)
            stockOverView.push("Day Low: " + document.querySelectorAll(".FR.nseHP")[0].innerText)
    
    
    
            return stockDate + "\n" + stockName + "\n" + stockPrice + "\n" + "Overview: " + "\n" + stockOverView + "\n";
            
        });
    

        doc
        .addPage()
        .fontSize(18)
        .text(data3, 100, 100);

        
        // await page.waitForSelector(".buy_sellper");
    
        await page1.evaluate(function () {
            window.scrollBy(0, 2650);
        });
        
        // await page.waitForSelector("");
    
        
        await page1.waitForSelector('#news');  // Method to ensure that the element is loaded
        
        await page1.screenshot({
        path: 'news.png'
        });

        doc.image('news.png', {
            fit: [450, 500],
            align: 'center',
            valign: 'center'
            });
    
    
        await page1.evaluate(function () {
            window.scrollBy(0, 300);
        });
    
        await page1.waitForSelector(".buy_sellper");
    
        let data4 = await page1.evaluate(function () {
            let reccomendations = []
            for (let i = 0; i <= 2; i++) {
                reccomendations.push(document.querySelectorAll(".buy_sellper li")[i].innerText);
            }
    
            return "According to community sentiments, the recommendations for this stock is: " + reccomendations;
        });

        
    
        await page1.evaluate(function () {
            window.scrollBy(0, 1000);
        });
    
        await page1.screenshot({ path: 'brokerResearch.png' })

        doc
        .addPage()
        .image('brokerResearch.png', {
            fit: [450, 500],
            align: 'center',
            valign: 'center'
            })
        .fontSize(18)
        .text(data4, 100, 100);
    
        const page2 = await browser.newPage();  // open new tab
        await page2.goto("https://www.facebook.com");  // go to facebook.com 
        await page2.bringToFront();   // make the tab active
    
        await page2.waitForSelector("#email");
        await page2.type("#email","wafolo5564@jq600.com");
    
        await page2.type("#pass","788557855");
    
        await page2.click('[type="submit"]');
    
        await page2.waitForNavigation();
    
        await page2.waitForSelector('div');
    
        // await page2.click('div');
        await page2.mouse.click(132, 103, { button: 'left' })
    
    
        await page2.waitFor(5000);
    
        await page2.goto("https://www.facebook.com/profile.php?id=100070140549250");
        await page2.waitFor(3000);
    
        await page2.waitForSelector('div');
    
        // await page2.click('div');
        await page2.mouse.click(132, 103, { button: 'left' })
    
        await page2.waitForSelector(".m9osqain.a5q79mjw.gy2v8mqq.jm1wdb64.k4urcfbm.qv66sw1b span");
    
        await page2.click(".m9osqain.a5q79mjw.gy2v8mqq.jm1wdb64.k4urcfbm.qv66sw1b span");

        let sentenceList = [
            data1,
            data3 +"\n"+ data4,
        ];

        for(let j=0; j<sentenceList.length; j++){
            let stockInfo = sentenceList[j];

            for(let i=0; i<stockInfo.length; i++){
                await page2.keyboard.press(stockInfo[i]);

                if(i === stockInfo.length - 1){
                    await page2.waitFor(2000)
                    await page2.keyboard.down("Control");
                    await page2.keyboard.press(String.fromCharCode(13));

                    await page2.keyboard.up("Control");

                    await page2.waitFor(4000);

                    console.log("done");

                    await page2.click(".m9osqain.a5q79mjw.gy2v8mqq.jm1wdb64.k4urcfbm.qv66sw1b span");
                }
            }
        }

        doc
        .addPage()
        .fontSize(15)
        .text('Here is a link to check post on facebook!', 100, 100)
        .link(100, 100, 160, 27, 'https://www.facebook.com/profile.php?id=100070140549250')
        .text("\n")
        .text("\n")
        .text("\n")
        .text("\n")
        .fontSize(10)
        .text("DISCLAIMER: Investment in markets is subject to market risk. This report can just provide you some aid in calculating your stock profits/risks.");

        
        doc.end();

        

        console.log("done");

        await browser.close()
        
        


    }catch(error){
        console.log(error);
    }
    
    
})();