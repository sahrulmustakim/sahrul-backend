import Route from '@ioc:Adonis/Core/Route'
import Message from 'App/Models/Message'

Route.get('/', async () => {
  return 'Automatic Birthday Message'
})

Route
  .group(() => {
    Route.get('users', 'UsersController.index')
    Route.post('users', 'UsersController.create')
    Route.put('users/:id', 'UsersController.update')
    Route.delete('users/:id', 'UsersController.delete')
  })
  .prefix('/api')

// TASK SCHEDULAR EVERY MINUTES
var moment = require('moment-timezone')
var CronJob = require('cron').CronJob
var job = new CronJob(
  '0 */1 * * * *',
  async function() {
    const datetime = moment.tz(new Date(), 'Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss')
    const message = await Message.query().where('date_send', datetime).where('type', 'unsent').select('*')
    message.forEach((item) => {
      // SENT MESSAGE TO THIRD PARTY
      const https = require("https")

      const data = JSON.stringify({
        message: item.message
      })

      const options = {
        hostname: "hookb.in",
        port: 443,
        path: "/kxBQxNagOqTBDokBLQY9",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": data.length
        }
      }

      const req = https.request(options, async (res) => {
        console.log(`status: ${res.statusCode}`)

        const msg_update = await Message.findOrFail(item.id)
        msg_update.type = 'sent'
        await msg_update.save()
      });

      req.write(data);
      req.end();
    });
  },
  null,
  true,
  'Asia/Jakarta'
);
job.start()
