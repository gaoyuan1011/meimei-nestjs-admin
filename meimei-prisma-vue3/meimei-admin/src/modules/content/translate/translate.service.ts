import { Injectable } from "@nestjs/common";
import puppeteer, { type Browser } from "puppeteer";
import { baiduMap, deeplMap, sougouMap, youdaoMap } from "src/common/contants/translate.contants";
import UserAgent from 'user-agents';

@Injectable()
export class TranslateService {
  constructor(){}

  browser: Browser
  async initBrowser() {
    this.browser = await puppeteer.launch({
      protocolTimeout: 3000,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      userDataDir: './.cache',
      // headless: false,
      // devtools: true // 自动打开开发者工具
      // 代理
      // args: [`--proxy-server=http://localhost:7890`],
      // headless: true
      // executablePath: '/work/app/chrome/linux-130.0.6670.0/chrome-linux64/chrome'
    });
  }

  async getBrowser() {
    if (this.browser) {
      return this.browser
    }
    await this.initBrowser()
    return this.browser
  }

  translate(params: { query: string, from: string, to: string }) {
    const translates = [this.baiduTranslate.bind(this), this.sougouTranslate.bind(this), this.youdaoTranslate.bind(this)]
    return translates[Math.floor(translates.length * Math.random())](params)
  }

  /** 百度翻译 */
  private async baiduTranslate(params: { query: string, from: string, to: string }) {
    const browser = await this.getBrowser()
    const page = await browser.newPage();
    const userAgent = new UserAgent({
        deviceCategory: 'desktop' // 指定设备类型为桌面
    }).toString();
    await page.setUserAgent(userAgent);
    // 启用缓存
    await page.setCacheEnabled(true);
    try {
      // 设置代理规则
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        const useProxy = request.url().includes('/ait/text/translate')
        if (useProxy) {
          const data = JSON.parse(request.postData())
          if (data) {
            data.from = params.from
            data.to = params.to
          }
          // const headers = request.headers()
          // headers['sec-ch-ua-platform'] = '"Windows"'
          // headers['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/130.0.0.0 Safari/537.36'
          request.continue({
            postData: JSON.stringify(data),
            // headers
          });
          return
        }
        request.continue();
      })
      page.on('response', async (response) => {
        const url = response.url();
        const useProxy = url.includes('/langdetect')
        if (useProxy) {
          const data = await response.json()
          if (data?.lan) {
            params.from = data.lan
          }
        }
      })
      const url = new URL('https://fanyi.baidu.com/mtpe-individual/multimodal')
      url.searchParams.append('query', params.query)
      url.searchParams.append('lang', [params.from, params.to].join('2'))
      await page.goto(url.toString(), { timeout: 3000, waitUntil: 'networkidle2' });
      // page.on('console', msg => {
      //     console.log('浏览器控制台:', msg.text());
      // });
      const selector = '#trans-selection'
      await page.waitForSelector(selector); // 等待元素加载
      const text = await page.evaluate((sel) => {
        const element = document.querySelector<HTMLDivElement>(sel);
        return element ? element.innerText.trim() : null; // 获取文本并去除空白
      }, selector);
      return {
        data: {
          type: 'baidu',
          text
        }
      }
    } catch (error) {
      throw new Error(error)
    } finally {
      page.close()
    }
  }

  /** 搜狗翻译 */
  async sougouTranslate(params: { query: string, from: string, to: string }) {
    const from = sougouMap.get(baiduMap.get(params.from))
    const to = sougouMap.get(baiduMap.get(params.to))
    if (!from || !to) {
      return this.baiduTranslate(params)
    }
    params.from = from
    params.to = to

    // https://fanyi.sogou.com/text?keyword=&transfrom=auto&transto=en&model=general&exchange=true
    // https://fanyi.sogou.com/text?keyword=&transfrom=auto&transto=en&model=general&exchange=true
    const browser = await this.getBrowser()
    const page = await browser.newPage();
    const userAgent = new UserAgent({
        deviceCategory: 'desktop' // 指定设备类型为桌面
    }).toString();
    await page.setUserAgent(userAgent);
    // 启用缓存
    await page.setCacheEnabled(true);
    try {
      // 设置代理规则
      // await page.setRequestInterception(true);
      const url = new URL('https://fanyi.sogou.com/text')
      url.searchParams.append('keyword', params.query) // params.query
      url.searchParams.append('transfrom', params.from)
      url.searchParams.append('transto', params.to)
      url.searchParams.append('model', 'general')
      url.searchParams.append('exchange', 'true')
      await page.goto(url.toString(), { timeout: 8000, waitUntil: 'networkidle2' });

      // const selectorInput = '#trans-input'
      // await page.waitForSelector(selectorInput); // 等待元素加载
      // await page.click(selectorInput); // 点击输入框以获得焦点
      // await page.type(selectorInput, params.query, { delay: 0 }); // 每个字符输入间隔 100ms
      // await page.locator(selectorInput).fill(params.query)

      const selector = '#trans-result'
      await page.waitForSelector(selector); // 等待元素加载
      const text = await page.evaluate((sel) => {
        const element = document.querySelector<HTMLDivElement>(sel);
        return element ? element.innerText.trim() : null; // 获取文本并去除空白
      }, selector);
      return {
        data: {
          type: 'sougou',
          text
        }
      }
    } catch (error) {
      throw new Error(error)
    }finally{
      page.close()
    }
  }

  /** 有道翻译 */
  async youdaoTranslate(params: { query: string, from: string, to: string }) {
    // https://fanyi.youdao.com/#/TextTranslate
    const from = youdaoMap.get(baiduMap.get(params.from))
    const to = youdaoMap.get(baiduMap.get(params.to))
    if (!from || !to) {
      return this.baiduTranslate(params)
    }
    params.from = from
    params.to = to

    const browser = await this.getBrowser()
    const page = await browser.newPage();
    const userAgent = new UserAgent({
        deviceCategory: 'desktop' // 指定设备类型为桌面
    }).toString();
    await page.setUserAgent(userAgent);
    // 启用缓存
    await page.setCacheEnabled(true);
    try {
      const url = new URL('https://fanyi.youdao.com/#/TextTranslate')
      await page.goto(url.toString(), { timeout: 5000, waitUntil: 'networkidle2' });
      // 在导航之前设置本地存储
      await page.evaluate((params) => {
        localStorage.setItem('fanyiweb_dict_ls_lan_scene:textTranslate', `{"lanFrom":"${params.from}","lanTo":"${params.to}"}`);
      }, params);
      await page.reload({ timeout: 5000 })
      const selectorInput = '#js_fanyi_input'
      // page.on('console', (msg) => {
      //   console.info('msg', msg.text())
      // })
      await page.waitForSelector(selectorInput)
      await page.click(selectorInput);
      await page.evaluate((sel, query) => {
        const element = document.querySelector<HTMLDivElement>(sel);
        if (element) {
          element.innerHTML = query
        }
      }, selectorInput, params.query)
      // await page.waitForSelector(selectorInput); // 等待元素加载
      // await page.click(selectorInput); // 点击输入框以获得焦点
      // // await page.type(selectorInput, params.query, { delay: 0 }); // 每个字符输入间隔 100ms
      await page.type(selectorInput, ' ', { delay: 0 })

      const selector = '#js_fanyi_output_resultOutput'
      await page.waitForSelector(selector); // 等待元素加载
      const text = await page.evaluate((sel) => {
        const element = document.querySelector<HTMLDivElement>(sel);
        return element ? element.textContent.trim() : null; // 获取文本并去除空白
      }, selector);
      return {
        data: {
          type: 'youdao',
          text
        }
      }
    } catch (error) {
      throw new Error(error)
    }finally{
      page.close()
    }
  }

  /** deepl翻译 */
  async deeplTranslate(params: { query: string, from: string, to: string }) {
    // https://www.deepl.com/zh/translator#zh/ja/1

    const from = deeplMap.get(baiduMap.get(params.from))
    const to = deeplMap.get(baiduMap.get(params.to))
    if (!from || !to) {
      return this.baiduTranslate(params)
    }
    params.from = from
    params.to = to

    const browser = await this.getBrowser()
    const page = await browser.newPage();
    const userAgent = new UserAgent({
        deviceCategory: 'desktop' // 指定设备类型为桌面
    }).toString();
    await page.setUserAgent(userAgent);
    // 启用缓存
    await page.setCacheEnabled(true);
    try {
      const url = new URL(`https://www.deepl.com/zh/translator#${params.from}/${params.to}/${params.query}`)
      await page.goto(url.toString(), { timeout: 10000, waitUntil: 'networkidle2' });
      // const selectorInput = '#textareasContainer > div.rounded-es-inherit > section > div > div.relative > d-textarea > div:nth-child(1)'
      // await page.waitForSelector(selectorInput); // 等待元素加载
      // await page.click(selectorInput); // 点击输入框以获得焦点
      // // await page.type(selectorInput, params.query, { delay: 0 }); // 每个字符输入间隔 100ms
      // await page.locator(selectorInput).fill(params.query)
      const selector = '#textareasContainer > div.rounded-ee-inherit > section > div.rounded-inherit > d-textarea > div'
      await page.waitForSelector(selector + ' > p > span', { timeout: 10000 }); // 等待元素加载
      const text = await page.evaluate((sel) => {
        const element = document.querySelector<HTMLDivElement>(sel);
        return element ? element.textContent.trim() : null; // 获取文本并去除空白
      }, selector);
      return {
        data: {
          type: 'deepl',
          text
        }
      }
    } catch (error) {
      throw new Error(error)
    }finally{
      page.close()
    }
  }
}