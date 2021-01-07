import puppeteer from 'puppeteer';
import fs from 'fs'
async function startBrowser() {
    var filename = 'output.txt';
    let browser; 
    let page;
    let urls;
    let levelStage = {
        '1':0,
        '2':0,
        '3':0,
        '4':0
    }
    let levelMapping = {
        '1':'ContentPlaceHolder_rpt_lkbstate_',
        '2':'ContentPlaceHolder_rpt_lkbblock_',
        '3':'ContentPlaceHolder_rpt_lblstate_',
        '4':'ContentPlaceHolder_rpt_lkbvillage_'
    }
    let activeLevel = 1;
    let values = [];
    try {
        console.log('opening the browser');
        browser = await puppeteer.launch({
                headless:false, 
                'ignoreHTTPSErrors': true});
        page = await browser.newPage();

        await page.goto("https://ejalshakti.gov.in/IMISReports/Reports/BasicInformation/rpt_RWS_RuralPopulation_D.aspx?Rep=0");
        let list = await page.waitForSelector(".points");
        let lists = await page.$$('.points');
        await lists[9].click();
        await page.waitForTimeout(5000);
        let newpages = await browser.pages();
        console.log('LENGTH',newpages.length);
        let pages = await browser.pages();
        console.log('PAGES',pages.length);
        await pages[pages.length-1].bringToFront();
        let currentTab = pages[pages.length-1];
        currentTab.on('console', consoleObj => console.log(consoleObj.text()));
        let lala = await currentTab.waitForSelector(".oddrowcolor");
        await currentTab.evaluate(() => {
            let states = document.querySelectorAll('.oddrowcolor');
            let mp = states[8].children;
            console.log('states',mp[1].children[0])
            mp[1].children[0].click();
        })
        await currentTab.waitForTimeout(2000);
        //const nodes = await currentTab.$$(`${'#tableReportTable'} > tbody > tr`);
        //const properties =  (await (await nodes[0].getProperty('a')).jsonValue());
       

        var navigate = async (base,base2) => {
            console.log('IN',activeLevel,levelMapping[activeLevel],levelStage[activeLevel]);
            let identfier = '#' + levelMapping[activeLevel] + levelStage[activeLevel];
            let place = null;
            let found = false;
            let spanVal;
            try {
                await currentTab.waitForSelector(identfier,{timeout: 10000});
                found = true;
                // ...
            } catch (error) {
                console.log("The end");
                levelStage[activeLevel] = 0;
                place = null;
            }
            if(found) {
                place = await currentTab.$(identfier);
                spanVal =  await currentTab.$eval(identfier, el => el.innerText);
            }
            if(place) {
                if(activeLevel == 4) {
                    let counti = '#ContentPlaceHolder_rpt_lbltot_' + levelStage[activeLevel];
                    let count = await currentTab.$eval(counti, el => el.innerText);
                    var obj = {
                        bb:base,
                        bb2:base2,
                        origin: spanVal,
                        population: parseFloat(count.replace(/,/g, ''))
                    }
                    values.push(obj);
                    levelStage[activeLevel] ++;
                    var str = JSON.stringify(obj, null, 4);
                    fs.appendFile('output.txt', str, function (err) {
                        if (err) throw err;
                        console.log('Saved!');
                      });
                    await navigate(base,base2);
                } else {
                    levelStage[activeLevel] ++;
                    activeLevel ++;
                    await place.click();
                    await currentTab.waitForTimeout(2000);
                    if(activeLevel == 2) {
                        await navigate(spanVal,base2);
                    } else {
                        if(activeLevel == 3) {
                            await navigate(base,spanVal);
                        }
                        await navigate(base,base2);
                    }
                }
            } else {
                if(activeLevel != 1) {
                    activeLevel --;
                    await currentTab.goBack();
                    await currentTab.waitForTimeout(2000);
                    await navigate(base,base2);
                }
            }
        }
        navigate()
        .then(() => {
            console.log('DATA',values)
            var str = JSON.stringify(values, null, 4);
            /*fs.writeFile(filename, str, function(err){
                if(err) {
                    console.log(err)
                } else {
                    console.log('File written!');
                }
            });*/
        })
        /* 
        getlevelidentifier+identifierstate
        if(exists) {
            if(activelevel == 5) {
                store value; 
            } else {
                activelevel++
                onclick 
            }
            identifierstate ++
            recall the function
        } else if {
            activelevel--;
            if(activelevel <0) {
                STOP
            } else {
                page.goback();
                recall the function
            }
        }

    */
    } catch(err) {
        console.log('ERROR',err);
    }
}
startBrowser();
/*let useFacebook = await page.waitForSelector('.yWX7d');
await useFacebook.click();

//page.waitForSelector("[aria-label='Email address or phone number']");
//await email.click();
//await page.$eval("[aria-label='Email address or phone number']", el => el.value = 'stutspices@yahoo.co.in');
await page.waitForTimeout(3000);
await page.type("[aria-label='Email address or phone number']",'stuti.mohgaonkar@gmail.com');
await page.type("[aria-label='Password']",'icecreaminmagie');
let login = await page.waitForSelector('._52e0');
await login.click();

await page.waitForTimeout(10000);
const getThemAll = await page.$$('.DPiy6');
console.log('getThemAll',getThemAll.length);
if(getThemAll && getThemAll.length) {
    const random = Math.floor(Math.random()*(getThemAll.length));
    await getThemAll[random].click();
    await page.waitForSelector('.PjuAP .qyrsm');
    const userName =  await page.$eval('.PjuAP .qyrsm', el => el.innerText);
    if(friends.indexOf(userName) > -1) {
        let messageBox = await page.waitForSelector('.ItkAi');
        let message = messages[Math.floor(Math.random()*(messages.length))];

        await messageBox.click();
        await page.keyboard.type('Hi! ' + userName + ', ' + message , {delay: 30});
        await page.keyboard.press('Enter');
        await page.waitForTimeout(3000); 
    }  

} */


//await browser.close();