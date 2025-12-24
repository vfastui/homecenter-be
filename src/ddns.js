import { getWanIP } from './utils.js'
import { modifyDNS } from './mod/dnspod.js'

let lastIp = ''
const ddns = async () => {
    let currentIp = await getWanIP()
    if (lastIp !== currentIp) {
        await modifyDNS()
        lastIp = currentIp
        console.log('修改ip成功')
    } else {
        console.log('ip 无变化')
    }
}
export { ddns }
