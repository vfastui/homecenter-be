import { getWanIP } from '../src/utils.js'
getWanIP().then((ip) => {
    console.log('当前外网 IP:', ip)
})
