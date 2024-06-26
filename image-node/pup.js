const axios = new require("axios");
const puppeteer = require("puppeteer-extra");
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const { executablePath } = require("puppeteer");
const proxy = process.argv[2] || "dev";
if (!proxy) {
  console.error("Must config proxy, exit after 10s");
  setTimeout(() => process.exit(), 10000);
} else {
  //proxy dạng host:port:user:pass
  let arr = proxy.split(":");
  let host, port, username, password;
  if (arr.length) {
    host = arr[0];
    port = arr[1];
    username = arr[2];
    password = arr[3];
  }

  let args = ["--window-size=300,400"];
  if (host && port) {
    args.push(`--proxy-server=${host}:${port}`);
  }

  puppeteer
    .launch({
      headless: false,
      executablePath: executablePath(),
      args: args,
    })
    .then(async (browser) => {
      const pages = await browser.pages();
      const page = pages.length > 0 ? pages[0] : browser.newPage();

      //Fake response
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        if (request.url() === "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd") {
          console.log("fake response");
          request.respond({
            content: "application/json",
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({
              "ethereum": {
                "usd": 1569
              }
            }),
          });
        } else {
          request.continue();
        }
      });


      if (username && password) {
        await page.authenticate({
          username: username,
          password: password,
        });
      }
      await page.setDefaultNavigationTimeout(60000);
      await page.goto("https://bookingonline.agribank.com.vn/muavangSJCtructuyen");
      while (true) {
        try {




          const frameHandle = await page.waitForSelector("div#cf-turnstile iframe");       
          const frame = await frameHandle.contentFrame();


          const chk = await frame.waitForSelector("div#content");
          chk.click();
          await page.waitForFunction(
            'document.getElementsByName("cf-turnstile-response").length>0 && document.getElementsByName("cf-turnstile-response")[0].value'
          );
          const elementValue = await page.$eval(
            "input[name=cf-turnstile-response]",
            (el) => el.value
          );
          // try {
          //   //Xem điều kiện nào đến trước
          //   await Promise.race([c1, c2]);
          // } catch (error) {
          //   //còn lại là error
          //   console.log(error);
          // }
          // Promise.race([c1, c2])
          //   .then((resolve) => {
          //     console.log("Success " + resolve);
          //   })
          //   .catch((error) => {
          //     console.log("Error " + error);
          //   });

          //Lấy được thì đẩy lên kho, chạy tiếp vòng 2
          const captchaQueueItem = {
            ResolveText: elementValue,
            ResolveDate: new Date(),
          };
          axios
            .post("http://db2.vnwax.com/api/captcha/cf", captchaQueueItem)
            .then((response) => {
              console.log("Success post to queue");
            })
            .catch((error) => {
              console.error(error);
            });
          console.log("success resolve captcha. Wait for next");
        } catch (error) {
          console.error(error);
          await sleep(3000);
        } finally {
        }

       // await page.reload();
      }
    });
}
