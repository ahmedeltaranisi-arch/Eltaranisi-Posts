import * as zod  from 'zod'

import { zodResolver } from '@hookform/resolvers/zod';

export let schema= zod.object({
  name : zod.string().nonempty('Name is required').min(3 , 'Min 3 Letters').max(8 , 'Max 8 Letters') ,
    username : zod.string().nonempty('user Name is required').regex(/^[A-Z][a-z0-9]{5,10}$/ , 'Invalid user Name'),

  email : zod.string().nonempty('Email Required').email('Inavlid Email') ,
  password : zod.string().nonempty('Password Required').regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/ , 'Invalid Password' ) ,
  gender:zod.string().nonempty('Gender is required') ,
  dateOfBirth : zod.coerce.date('Date Rquired').refine(  (dateVal)=>{
    let current= new Date().getFullYear()
    let year = dateVal.getFullYear()
    let age = current - year 
    return age > 20
  }, 'Age must be greater than 20' )  ,
  rePassword:zod.string().nonempty('rePassword Required')
}).refine((obj)=>{
  if(obj.password === obj.rePassword){
    return true
  }
  else{
    return false
  }
} , {path:['rePassword'] , message : 'password & rePassword not matched' })