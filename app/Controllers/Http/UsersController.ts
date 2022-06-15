import User from 'App/Models/User'
import Message from 'App/Models/Message'

export default class UsersController {
  public async index({ response }) {
    const user = await User.all()
    response.status(200).json({
      'code': 200,
      'message': 'Success',
      'status': true,
      'data': user
    })
  }

  public async create({ request, response }) {
    try {
      const user = new User()
      user.first_name = request.input('first_name')
      user.last_name = request.input('last_name')
      user.birthday_date = request.input('birthday_date')
      user.location = request.input('location')
      await user.save()

      var moment = require('moment-timezone')

      const message = new Message()
      message.user_id = user.id
      message.date_send = moment.tz(new Date(), user.location).format('YYYY') + moment.tz(user.birthday_date + " 09:00:00", user.location).format('-MM-DD HH:mm:ss')
      message.message = 'Hey, ' + user.first_name + ' ' + user.last_name + ' it’s your birthday'
      message.type = 'unsent'
      await message.save()

      response.status(200).json({
        'code': 200,
        'message': 'Data Created',
        'status': true,
        'data': {
          'user': user,
          'message': message
        }
      })
    } catch (error) {
      response.badRequest({ error: error })
    }
  }

  public async update({ params, request, response }) {
    try {
      const user = await User.findOrFail(params.id)
      user.first_name = request.input('first_name')
      user.last_name = request.input('last_name')
      user.birthday_date = request.input('birthday_date')
      user.location = request.input('location')
      await user.save()

      await Message.query().where('user_id', params.id).where('type', 'unsent').delete()

      var moment = require('moment-timezone')

      const message = new Message()
      message.user_id = user.id
      message.date_send = moment.tz(new Date(), user.location).format('YYYY') + moment.tz(user.birthday_date + " 09:00:00", user.location).format('-MM-DD HH:mm:ss')
      message.message = 'Hey, ' + user.first_name + ' ' + user.last_name + ' it’s your birthday'
      message.type = 'unsent'
      await message.save()

      response.status(200).json({
        'code': 200,
        'message': 'Data Updated',
        'status': true,
        'data': {
          'user': user,
          'message': message
        }
      })
    } catch (error) {
      response.badRequest({ error: error })
    }
  }

  public async delete({ params, response }) {
    try {
      await Message.query().where('user_id', params.id).where('type', 'unsent').delete()

      const user = await User.findOrFail(params.id)
      await user.delete()

      response.status(200).json({
        'code': 200,
        'message': 'Data Deleted',
        'status': true
      })
    } catch (error) {
      response.badRequest({ error: error })
    }
  }
}
