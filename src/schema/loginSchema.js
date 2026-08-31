import * as zod  from 'zod'

import { zodResolver } from '@hookform/resolvers/zod';

export let loginschema= zod.object({
  

  email : zod.string().nonempty('Email Required').email('Inavlid Email') ,
  password : zod.string().nonempty('Password Required').regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/ , 'Invalid Password' ) ,

 
})