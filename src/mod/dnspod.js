// see https://console.cloud.tencent.com/api/explorer?Product=dnspod&Version=2021-03-23&Action=ModifyRecord
import conf from '../config.toml'
import { getWanIP } from '../utils.js'
function sha256(message, secret = '', encoding) {
    const hmac = new Bun.CryptoHasher('sha256', secret)
    return hmac.update(message).digest(encoding)
}
function getHash(message, encoding = 'hex') {
    const hasher = new Bun.CryptoHasher('sha256')
    return hasher.update(message).digest(encoding)
}
function getDate(timestamp) {
    const date = new Date(timestamp * 1000)
    const year = date.getUTCFullYear()
    const month = ('0' + (date.getUTCMonth() + 1)).slice(-2)
    const day = ('0' + date.getUTCDate()).slice(-2)
    return `${year}-${month}-${day}`
}

const SECRET_ID = conf.tencent.secretId
const SECRET_KEY = conf.tencent.secretKey
const TOKEN = ''

const host = 'dnspod.tencentcloudapi.com'
const service = 'dnspod'
const region = ''
const action = 'ModifyRecord'
const version = '2021-03-23'
const timestamp = parseInt(String(new Date().getTime() / 1000))
const date = getDate(timestamp)

let payloadJson = { Domain: conf.ddns.domain, RecordType: 'A', RecordLine: '默认', Value: '', RecordId: conf.ddns.recordId, SubDomain: conf.ddns.subDomain }
payloadJson.Value = await getWanIP()
const payload = JSON.stringify(payloadJson)

const signedHeaders = 'content-type;host'
const hashedRequestPayload = getHash(payload)
const httpRequestMethod = 'POST'
const canonicalUri = '/'
const canonicalQueryString = ''
const canonicalHeaders = 'content-type:application/json; charset=utf-8\n' + 'host:' + host + '\n'

const canonicalRequest = httpRequestMethod + '\n' + canonicalUri + '\n' + canonicalQueryString + '\n' + canonicalHeaders + '\n' + signedHeaders + '\n' + hashedRequestPayload

const algorithm = 'TC3-HMAC-SHA256'
const hashedCanonicalRequest = getHash(canonicalRequest)
const credentialScope = date + '/' + service + '/' + 'tc3_request'
const stringToSign = algorithm + '\n' + timestamp + '\n' + credentialScope + '\n' + hashedCanonicalRequest

const kDate = sha256(date, 'TC3' + SECRET_KEY)
const kService = sha256(service, kDate)
const kSigning = sha256('tc3_request', kService)
const signature = sha256(stringToSign, kSigning, 'hex')

const authorization = algorithm + ' ' + 'Credential=' + SECRET_ID + '/' + credentialScope + ', ' + 'SignedHeaders=' + signedHeaders + ', ' + 'Signature=' + signature

const headers = {
    Authorization: authorization,
    'Content-Type': 'application/json; charset=utf-8',
    Host: host,
    'X-TC-Action': action,
    'X-TC-Timestamp': timestamp,
    'X-TC-Version': version,
}

if (region) {
    headers['X-TC-Region'] = region
}
if (TOKEN) {
    headers['X-TC-Token'] = TOKEN
}

const modifyDNS = async () => {
    try {
        const response = await fetch(`https://${host}`, {
            method: httpRequestMethod,
            headers: headers,
            body: payload,
        })
        return  await response.json()
    } catch (error) {
        console.error(error)
    }
}
export { modifyDNS }
