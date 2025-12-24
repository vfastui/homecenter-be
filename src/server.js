import { Hono } from 'hono'
import conf from './config.toml'
import { ddns } from './ddns.js'
const app = new Hono()
app.get('/', (c) => {
    return c.text('Hello Hono!')
})

async function runTask() {
    try {
        await ddns()
    } catch (error) {
        console.error('任务出错:', error)
    }
    setTimeout(runTask, conf.task.duration * 1000)
}
await runTask()
export default {
    port: 9876,
    fetch: app.fetch,
}
