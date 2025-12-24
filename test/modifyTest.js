import { modifyDNS } from '../src/mod/dnspod'
modifyDNS().then((data) => {
    console.log(data)
})
