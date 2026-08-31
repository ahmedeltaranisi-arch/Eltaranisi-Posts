import * as zod from 'zod'

import { zodResolver } from '@hookform/resolvers/zod';

export let changePasswordSchema = zod.object({

  currentPassword: zod.string().nonempty('Current Password Required'),
  newPassword: zod.string().nonempty('Password Required').regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, 'Invalid Password'),
  rePassword: zod.string().nonempty('rePassword Required'),

}).refine((obj) => {
  if (obj.newPassword === obj.rePassword) {
    return true
  }
  else {
    return false
  }
}, { path: ['rePassword'], message: 'password & rePassword not matched' })
