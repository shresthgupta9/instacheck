const fs = require("fs");
const puppeteer = require("puppeteer");

const website = "https://www.instagram.com";
const credentials = fs.readFileSync("credentials.txt", "utf-8").split("\n").filter(Boolean);
const uname = credentials[0];
const pword = credentials[1];

const binSearch = (arr, ele) => {
	let low = 0;
	let high = arr.length - 1;

	while (low <= high) {
		let mid = Math.floor((low + high) / 2);

		if (arr[mid] === ele) {
			return true;
			// break
		} else if (arr[mid] < ele) low = mid + 1;
		else if (arr[mid] > ele) high = mid - 1;
	}
	return false;
};

const writeArr = (arr, txtfile) => {
	// using filestream in case of big arrays
	let followersFile = fs.createWriteStream(txtfile, { flags: "w" });
	followersFile.on("error", function (err) {
		console.log(error);
	});
	arr.forEach(function (item) {
		followersFile.write(item + "\n");
	});
	followersFile.end();
};

async function start() {
	try {
		console.log("Started running script");

		/**************/

		console.log("launching browser and going to instagram");

		const browser = await puppeteer.launch();
		// const browser = await puppeteer.launch({ headless: false });
		const page = await browser.newPage();
		await page.goto(website, { waitUntil: "networkidle0" });

		/**************/

		console.log("filling user details and signing in");

		const unamebox = await page.$('input[name="username"]');
		await unamebox.type(`${uname}`);

		const pwordbox = await page.$('input[name="password"]');
		await pwordbox.type(`${pword}`);

		const loginbtn = await page.$('button[type="submit"]');
		await loginbtn.evaluate((loginbtn) => loginbtn.click());

		/**************/

		// dummy fn to make the script wait for some time
		await new Promise((resolve) => setTimeout(resolve, 5000));

		/**************/

		console.log("getting followers and following count");

		await page.goto(`${website}/${uname}`, { waitUntil: "networkidle0" });

		const followersElement = await page.waitForSelector(`a[href="/${uname}/followers/"]`);
		const followersText = await followersElement.evaluate((ele) => ele.textContent);
		const followersCount = parseInt(followersText.replace(/[^0-9]/g, ""), 10);

		const followingElement = await page.waitForSelector(`a[href="/${uname}/following/"]`);
		const followingText = await followingElement.evaluate((ele) => ele.textContent);
		const followingCount = parseInt(followingText.replace(/[^0-9]/g, ""), 10);

		console.log(`Followers: ${followersCount}, Following: ${followingCount}`);

		/**************/

		console.log("getting all following list");

		// going to following page and scrolling till can't no more
		await page.waitForSelector(`a[href="/${uname}/following/"]`);
		await page.click(`a[href="/${uname}/following/"]`);

		for (let index = 0; index < 10000000000; index++);

		await page.waitForSelector("._aade");

		let prevFollowingCnt = 0;
		let currFollowingCnt = await page.evaluate(() => {
			return document.querySelectorAll("._aano > div > div")[0]?.children.length === undefined
				? 0
				: document.querySelectorAll("._aano > div > div")[0]?.children.length;
		});

		while (prevFollowingCnt < currFollowingCnt) {
			prevFollowingCnt = currFollowingCnt;

			// await page.waitForSelector("._aacw");
			await page.waitForSelector("span[class=' _ap3b _aaco _aacw _aacx _aad7 _aade']");

			await page.evaluate(() => document.querySelectorAll("._aano > div > div")[0].lastChild.scrollIntoView());

			await new Promise((resolve) => setTimeout(resolve, 2500));

			currFollowingCnt = await page.evaluate(() => {
				return document.querySelector("._aano > div > div").children.length;
			});

			console.log(prevFollowingCnt, currFollowingCnt);
		}

		/**************/

		console.log("storing following in following.txt file");

		// storing following in an array as well as in a file
		const followingList = await page.evaluate(async () => {
			const elements = document.querySelectorAll("._aade, ._aad7, ._aacx");

			let suggestedEleFollowing = null;
			const temp = document.querySelectorAll(".x18hxmgj");
			temp.forEach((ele) => {
				if (ele.textContent === "Suggested for you") suggestedEleFollowing = ele;
			});

			let arr = [];
			elements.forEach((element) => {
				if (element.textContent !== "Following" && element.textContent !== "Follow") {
					if (suggestedEleFollowing !== null) {
						const distance1 = element.getBoundingClientRect().top;
						const distance2 = suggestedEleFollowing.getBoundingClientRect().top;

						if (distance1 < distance2) arr.push(element.textContent);
					} else {
						arr.push(element.textContent);
					}
				}
			});
			arr.sort();
			return arr;
		});

		writeArr(followingList, "following.txt");

		/**************/

		// closing following box
		const closeBtn = "_abl-";
		await page.waitForSelector(`button[class="${closeBtn}"]`);
		await page.click(`button[class="${closeBtn}"]`);

		/**************/

		// going to follower page and scrolling till can't no more
		console.log("getting all followers list");

		await page.waitForSelector(`a[href="/${uname}/followers/"]`);
		await page.click(`a[href="/${uname}/followers/"]`);

		for (let index = 0; index < 10000000000; index++);

		await page.waitForSelector("._aade");

		let prevFollowersCnt = 0;
		let currFollowersCnt = await page.evaluate(() => {
			return document.querySelectorAll("._aano > div > div")[0]?.children.length === undefined
				? 0
				: document.querySelectorAll("._aano > div > div")[0]?.children.length;
		});

		while (prevFollowersCnt < currFollowersCnt) {
			prevFollowersCnt = currFollowersCnt;

			await page.waitForSelector("._aacw");

			await page.evaluate(() => document.querySelectorAll("._aano > div > div")[0].lastChild.scrollIntoView());

			await new Promise((resolve) => setTimeout(resolve, 2500));

			currFollowersCnt = await page.evaluate(() => {
				return document.querySelectorAll("._aano > div > div")[0].children.length;
			});

			console.log(prevFollowersCnt, currFollowersCnt);
		}

		/**************/

		// storing followers in an array as well as in a file
		console.log("storing followers in followers.txt file");

		const followersList = await page.evaluate(() => {
			const elements = document.querySelectorAll("._aade, ._aad7, ._aacx");

			let suggestedEleFollowers = null;
			const temp = document.querySelectorAll(".x18hxmgj");
			temp.forEach((ele) => {
				if (ele.textContent === "Suggested for you") suggestedEleFollowers = ele;
			});

			let arr = [];
			elements.forEach((element) => {
				if (element.textContent !== "Following" && element.textContent !== "Follow") {
					if (suggestedEleFollowers !== null) {
						const distance1 = element.getBoundingClientRect().top;
						const distance2 = suggestedEleFollowers.getBoundingClientRect().top;

						if (distance1 < distance2) arr.push(element.textContent);
					} else {
						arr.push(element.textContent);
					}
				}
			});
			arr.sort();
			return arr;
		});

		writeArr(followersList, "followers.txt");

		/**************/

		console.log("calculating who is not following you");

		let notFollowing = [];

		for (let i = 0; i < followingList.length - 1; i++) {
			let flag = binSearch(followersList, followingList[i]);
			if (!flag) {
				notFollowing.push(followingList[i]);
			}
		}

		console.log("storing non followers in notfollowing.txt file");

		writeArr(notFollowing, "notfollowing.txt");

		/**************/

		console.log("Ended running script");

		// await browser.close();
	} catch (error) {
		console.log(error);
		console.log("Some error happened");
	}
}

start();
