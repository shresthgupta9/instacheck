const puppeteer = require("puppeteer");

const website = "https://www.instagram.com";
const uname = "shresthrajgupta";
const pword = "Quantum@operator123";

function customDelay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

async function start() {
  try {
    // launching browser and going to instagram
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(website, { waitUntil: "networkidle0" });

    // filling user details and signing in
    const unamebox = await page.$('input[name="username"]');
    await unamebox.type(`${uname}`);

    const pwordbox = await page.$('input[name="password"]');
    await pwordbox.type(`${pword}`);

    const loginbtn = await page.$('button[type="submit"]');
    await loginbtn.evaluate((loginbtn) => loginbtn.click());

    // just a dummy loop to make the script wait for some time
    for (let index = 0; index < 5000000000; index++);

    // // get followers and following count
    // await page.goto(`${website}/${uname}`, { waitUntil: "networkidle0" });

    // const followersElement = await page.waitForSelector(`a[href="/${uname}/followers/"]`);
    // const followersText = await followersElement.evaluate((ele) => ele.textContent);
    // const followersCount = parseInt(followersText.replace(/[^0-9]/g, ""), 10);

    // const followingElement = await page.waitForSelector(`a[href="/${uname}/following/"]`);
    // const followingText = await followingElement.evaluate((ele) => ele.textContent);
    // const followingCount = parseInt(followingText.replace(/[^0-9]/g, ""), 10);

    // console.log(followersCount, followingCount);

    const total = 711;

    // going to followers page and scrolling till can't no more
    await page.goto(`${website}/${uname}/followers/`, { waitUntil: "networkidle0" });

    await page.waitForSelector("._aacw");
    for (let index = 0; index < 5000000000; index++);

    let followingList = 0;
    while (followingList < total) {
      followingList = await page.evaluate(() => {
        const child = document.querySelectorAll("._aano > div > div")[0];
        child.lastChild.scrollIntoView();
        return child.children.length;
      });
      await customDelay(2000);
    }

    console.log(followingList);

    // const child = await page.evaluate(() => {
    //   const divElement = document.querySelector("._aano > div > div");
    //   // console.log(divElement);

    //   return divElement.children.length
    // });
    // let len = await page.evaluate(() => {
    //   return child.children.length
    // })

    // console.log(child);

    // for (let index = 0; index < 10000000000; index++);

    // const followersbox = await page.$(
    //   'div[style="display: flex; flex-direction: column; padding-bottom: 0px; padding-top: 0px; position: relative;"]'
    // );

    // await page.evaluate(() => {
    //   window.scrollTo(0, document.body.scrollHeight);
    // });

    // for (let index = 0; index < 10000000000; index++);

    // await browser.close();
  } catch (error) {
    console.log(error);
  }
}

start();

/*
var links = document.querySelectorAll('a[class="x1i10hfl xjbqb8w x1ejq31n xd10rxx x1sy0etr x17r0tee x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x1ypdohk xt0psk2 xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1a2a7pz notranslate _a6hd" ]');
var urls = [];
for (let link of links) {
    urls.push(link.getAttribute('href'));
}
console.log(urls.join('\n'));
*/

/*
let divElement = document.getElementsByClassName('_aano');
let child = divElement[0].children[0].children[0];
child.lastChild.scrollIntoView();
*/
