import { $ } from 'bun';

async function getNetworkTraffic(ip) {
    const output = await $`netstat -ib | grep ${ip}`.text()
    const [name, mtu, network, address, ipkts,ierrs, ibytes, opkts,operrs, obytes] = output.trim().split(/\s+/);
    return {
        interface: name,
        receivedBytes: parseInt(ibytes),
        sentBytes: parseInt(obytes),
    };
}

const traffic = await getNetworkTraffic('10.0.3.2')
console.log(`Interface: ${traffic.interface}`)
console.log(`Received: ${(traffic.receivedBytes / 1024 / 1024).toFixed(2)} MB`)
console.log(`Sent: ${(traffic.sentBytes / 1024 / 1024).toFixed(2)} MB`)

