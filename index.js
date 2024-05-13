let fs = require("fs");
const puppeteer = require("puppeteer");

const website = "https://www.instagram.com";
const uname = "excitedjerk";
const pword = "nikalsala";

async function start() {
  try {
    console.log("Started running script");

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

    // dummy fn to make the script wait for some time
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // get followers and following count
    await page.goto(`${website}/${uname}`, { waitUntil: "networkidle0" });

    const followersElement = await page.waitForSelector(`a[href="/${uname}/followers/"]`);
    const followersText = await followersElement.evaluate((ele) => ele.textContent);
    const followersCount = parseInt(followersText.replace(/[^0-9]/g, ""), 10);

    const followingElement = await page.waitForSelector(`a[href="/${uname}/following/"]`);
    const followingText = await followingElement.evaluate((ele) => ele.textContent);
    const followingCount = parseInt(followingText.replace(/[^0-9]/g, ""), 10);

    console.log(`Followers: ${followersCount}, Following: ${followingCount}`);

    // // going to following page and scrolling till can't no more
    // await page.waitForSelector(`a[href="/${uname}/following/"]`);
    // await page.click(`a[href="/${uname}/following/"]`);

    // await page.waitForSelector("._aade");

    // let prevFollowingCnt = 0;
    // let currFollowingCnt = await page.evaluate(() => {
    //   return document.querySelectorAll("._aano > div > div")[0].children.length;
    // });

    // console.log("Following details before-" + currFollowingCnt, prevFollowingCnt);

    // while (prevFollowingCnt < currFollowingCnt) {
    //   prevFollowingCnt = currFollowingCnt;

    //   await page.waitForSelector("._aacw");

    //   await page.evaluate(() => document.querySelectorAll("._aano > div > div")[0].lastChild.scrollIntoView());

    //   await new Promise((resolve) => setTimeout(resolve, 2000));

    //   currFollowingCnt = await page.evaluate(() => {
    //     return document.querySelectorAll("._aano > div > div")[0].children.length;
    //   });
    // }

    // console.log("Following details after-" + currFollowingCnt, prevFollowingCnt);

    // // storing following in an array as well as in a file
    // const followingList = await page.evaluate(() => {
    //   const elements = document.querySelectorAll("._aade, ._aad7, ._aacx");
    //   let arr = [];
    //   elements.forEach((element) => {
    //     if (element.textContent !== "Following") arr.push(element.textContent);
    //   });
    //   arr.sort();
    //   return arr;
    // });

    // // using filestream in case of big arrays
    // let followingFile = fs.createWriteStream("following.txt", { flags: "w" });
    // followingFile.on("error", function (err) {
    //   console.log(error);
    // });
    // followingList.forEach(function (v) {
    //   followingFile.write(v + "\n");
    // });
    // followingFile.end();

    // going to follower page and scrolling till can't no more
    await page.waitForSelector(`a[href="/${uname}/followers/"]`);
    await page.click(`a[href="/${uname}/followers/"]`);

    await page.waitForSelector("._aade");

    let prevFollowersCnt = 0;
    let currFollowersCnt = await page.evaluate(() => {
      return document.querySelectorAll("._aano > div > div")[0]?.children.length === undefined
        ? 0
        : document.querySelectorAll("._aano > div > div")[0]?.children.length;
    });

    console.log("Followers details-" + currFollowersCnt, prevFollowersCnt);

    while (prevFollowersCnt < currFollowersCnt) {
      prevFollowersCnt = currFollowersCnt;

      await page.waitForSelector("._aacw");

      await page.evaluate(() => document.querySelectorAll("._aano > div > div")[0].lastChild.scrollIntoView());

      await new Promise((resolve) => setTimeout(resolve, 2000));

      currFollowersCnt = await page.evaluate(() => {
        return document.querySelectorAll("._aano > div > div")[0].children.length;
      });
    }
    console.log("Followers details-" + currFollowersCnt, prevFollowersCnt);

    // storing followers in an array as well as in a file
    const followersList = await page.evaluate(() => {
      const elements = document.querySelectorAll("._aade, ._aad7, ._aacx");

      let flag = false;
      let suggestedEle;
      const checkflag = document.querySelectorAll(".x18hxmgj");
      checkflag.forEach((ele) => {
        if (ele.textContent === "Suggested for you") {
          flag = true;
          suggestedEle = ele;
        }
      });

      let arr = [];
      elements.forEach((element) => {
        if (element.textContent !== "Following" && element.textContent !== "Follow") {
          if (flag) {
            if (element.offsetTop < suggestedEle.offsetTop) arr.push(element.textContent);
          } else {
            arr.push(element.textContent);
          }
        }
      });
      arr.sort();
      return arr;
    });

    // using filestream in case of big arrays
    let followersFile = fs.createWriteStream("followers.txt", { flags: "w" });
    followersFile.on("error", function (err) {
      console.log(error);
    });
    followersList.forEach(function (v) {
      followersFile.write(v + "\n");
    });
    followersFile.end();

    console.log("Ended running script");

    // await browser.close();
  } catch (error) {
    console.log(error);
  }
}

start();
