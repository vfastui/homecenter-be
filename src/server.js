import { Hono } from 'hono'
import dnspod from './mod/dnspod.js'

const app = new Hono()
app.route('/', dnspod)
export default {
    port: 9876,
    fetch: app.fetch,
}
