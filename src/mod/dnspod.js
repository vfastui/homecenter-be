import { Hono } from 'hono'
//update ddns
import { dnspod } from 'tencentcloud-sdk-nodejs-dnspod'
import conf from '../config.toml'

let logs = []
let originIp = ''

async function getWanIP() {
    try {
        const response = await fetch('https://4.ipw.cn')
        return await response.text()
    } catch (error) {
        console.error('获取外网 IP 失败:', error)
        return 'error'
    }
}

async function compareIp() {
    let newIp = await getWanIP()
    if (newIp !== originIp) {
        originIp = newIp
        await updateDDNS(newIp)
        logs.push({ checkDate: new Date(), content: `IP更新：${newIp}` })
    } else {
        logs.push({ checkDate: new Date(), content: `IP无变化` })
    }
}

async function runTask() {
    originIp = await getRecordIp()
    let i = 1
    while (i < 100000) {
        await compareIp()
        await Bun.sleep(1000 * 60 * 60 * 2)
        i++
    }
}

// 这个地方不能await
runTask().then(() => {})

async function getRecordIp() {
    const dnsClient = dnspod.v20210323.Client
    const client = new dnsClient({
        credential: {
            secretId: conf.tencent.secretId,
            secretKey: conf.tencent.secretKey,
        },
        region: 'ap-beijing',
        profile: {
            signMethod: 'TC3-HMAC-SHA256',
            httpProfile: {
                reqMethod: 'POST',
                reqTimeout: 30,
                headers: {},
            },
        },
    })
    let modifyRecord = {
        Domain: conf.ddns.domain,
        RecordId: conf.ddns.recordId,
    }
    return await client.DescribeRecord(modifyRecord).then((data) => {
        return data.RecordInfo.Value
    })
}

async function updateDDNS(newIP) {
    const dnsClient = dnspod.v20210323.Client
    const client = new dnsClient({
        credential: {
            secretId: conf.tencent.secretId,
            secretKey: conf.tencent.secretKey,
        },
        region: 'ap-beijing',
        profile: {
            signMethod: 'TC3-HMAC-SHA256',
            httpProfile: {
                reqMethod: 'POST',
                reqTimeout: 30,
                headers: {},
            },
        },
    })
    let modifyRecord = {
        Domain: conf.ddns.domain,
        RecordType: 'A',
        RecordLine: '默认',
        Value: newIP,
        RecordId: conf.ddns.recordId,
        SubDomain: conf.ddns.subDomain,
    }
    /* 列出名单
    let DescribeRecordFilterList = {
        Domain: 'xining.me',
    }
    client.DescribeRecordList(DescribeRecordFilterList).then(data => {
        console.log(data, "fangying")
        return c.json(data)
    })*/
    return await client.ModifyRecord(modifyRecord).then((data) => {
        return data
    })
}

const app = new Hono()
app.get('/ddns-log', async (c) => {
    return c.json(logs)
})
export default app
