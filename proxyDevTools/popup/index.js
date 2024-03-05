class ProxyTools {
  constructor (options = {}) {
    this.options = options
    this.init()
  } 
  init () {
    this.headerRules = this.options.headerRules || []
  }
  async getOldRules () {
    const oldRules = await chrome.declarativeNetRequest.getDynamicRules()
    return oldRules
  }
  async updateHeaderRules (key, value, type) {
    const oldRules = await this.getOldRules()
    let hasChange = false
    const oldRuleIds = oldRules.map(rule => {
      if (rule.action && rule.action.type && rule.action.type === 'modifyHeaders') {
        const currentHeaders = rule.action.requestHeaders
        // 覆盖式替换 rules
        rule.action.requestHeaders = currentHeaders.map(headers => {
          if (headers.header === key) {
            headers.operation = type
            headers.value = value
            hasChange = true
          }
          return headers
        })
      }

      return rule.id
    })

    if (!hasChange) {
      oldRules.push({
        id: oldRules.length + 1,
        priority: 1,
        action: {
          type: "modifyHeaders",
          requestHeaders: [
            {
              header: key,
              operation: type,
              value: value
            }
        ]},
        condition: {}
      })
    }
    this.updateHeaderConfig(oldRuleIds, oldRules)
  }
  async updateHeaderConfig(oldRuleIds, newRules) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: oldRuleIds,
      addRules: newRules
    })
    console.log('update success!')
  }
  async clearHeaderConfig () {
    const oldRules = await this.getOldRules()
    const oldRuleIds = oldRules.map(rule => rule.id)
    this.updateHeaderConfig(oldRuleIds, [])
  }
}
const config = {
  '福建': '39.144.251.17',
  '云南': '14.204.99.200',
  '河南': '120.219.14.25',
  '山东': '223.104.196.70',
  '湖南': '120.227.208.180',
  '广东': '223.104.64.148',
  '浙江': '223.94.216.76',
  '内蒙古': '39.154.106.143',
  '湖北': '111.183.28.109',
  '广西': '125.73.10.197',
  '青海': '139.170.84.87',
  '山西': '118.73.224.214',
  '陕西': '113.201.200.227',
  '四川': '182.136.116.52',
  '江西': '183.219.41.223',
  '黑龙江': '112.102.95.62',
  '辽宁': '182.204.2.68',
  '安徽': '36.35.110.245',
  '贵州': '119.0.14.92',
  '重庆': '39.144.220.13',
  '北京': '120.244.156.72',
  '海南': '39.144.69.155',
  '新疆': '112.43.80.24',
  '江苏': '114.235.171.150',
  '甘肃': '42.94.194.174'
}

// 初始化信息
const proxyTool = new ProxyTools()
const ul = document.getElementById('list')
const showRes = document.getElementById('showRes')

const initDom = function () {
  const arr = Object.keys(config)

  arr.forEach((val) => {
    const el = document.createElement('li')
    el.innerText = val
    el.setAttribute('data-name', val)
    ul.appendChild(el)
  })
}

const clearLiActive = function () {
  const lis = ul.children
  for (let i = 0; i < lis.length; i++) {
    if (lis[i].className.indexOf('active') > -1) {
      lis[i].className = ''
      break
    }
  }
}

const initEvent = function () {
  ul.addEventListener('click', async function (event) {
    const target = event.target
    const currentName = target.getAttribute('data-name')
    if (!currentName) return
    clearLiActive()
    target.className = 'active'
    // 更新代理
    proxyTool.updateHeaderRules('x-forwarded-for', config[currentName], 'set')
    showRes.innerText = currentName
  }, false)
}

const closeProxy = async () => {
  if (showRes.innerText === '空') return
  await proxyTool.clearHeaderConfig()
  clearLiActive()
  showRes.innerText = '空'
}

initDom()
initEvent()
document.querySelector('.operate-btn').addEventListener('click', closeProxy, false)





