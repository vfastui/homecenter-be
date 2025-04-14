async function getWanIP() {
    try {
        const response = await fetch('https://4.ipw.cn')
        return await response.text()
    } catch (error) {
        console.error('获取外网 IP 失败:', error)
        return '无法获取外网 IP'
    }
}

getWanIP().then((ip) => {
    console.log('当前外网 IP:', ip)
})
