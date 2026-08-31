import { Avatar, Input, TextArea } from '@heroui/react'
import React, { useContext, useRef, useState } from 'react'
import {Button, Modal} from "@heroui/react";
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { AuthContext } from '../../Context/AuthContext';
export default function CreatePostCard() {
 const {userData}=   useContext(AuthContext)

console.log("USER DATA:", userData?.photo);

 const query=   useQueryClient()
  
   let image= useRef(null)

   let body = useRef(null)

   function prepareData(){
    let formData= new FormData()
    if( body.current.value){
formData.append('body' , body.current.value)
    }
    if(image.current.files[0]){
          formData.append('image' , image.current.files[0])

    }

    return formData
    
  
   }
   function createPostFunc(){
  return  axios.post(`https://route-posts.routemisr.com/posts` , prepareData()  , {
        headers:{
        Authorization : ` Bearer ${localStorage.getItem('token')}`

        }
    })
   }

 const {data , isPending , mutate} =  useMutation({
    mutationFn:createPostFunc ,
    onSuccess:()=>{
        if(body.current){
                      body.current.value=null 
        }

        if(image.current){
          image.current.value =null
       
        }
         setuploadedImg(null)
   

        toast.success("post created successfully")
       setTimeout(() => {
         query.invalidateQueries({queryKey:['getPost'] , refetchType:'all'})
        
       }, 1000);

     
      
    } ,
    onError:()=>{
         toast.error("Cannot  create Post")
    }
   })


   console.log(data);
   
    const [uploadedImg, setuploadedImg] = useState(null)
    function hanleImagePreview(e){
        console.log(e.target.files[0]);
      let imgSrc=  URL.createObjectURL(e.target.files[0])
      setuploadedImg(imgSrc)

    }

    function handleCloseImg(){
        setuploadedImg(null)
        // input .value = null
        image.current.value= null
    }
  return (
    <div className='bg-white p-4 rounded-2xl shadow-sm border border-gray-100 w-full max-w-xl mx-auto mb-5 mt-3'>
      <div className='flex gap-3 items-center'>
           <Avatar>
        <Avatar.Image alt={userData?.name || "John Doe"} src={userData?.photo} />
      </Avatar>

          <Modal>
      <Button className='flex-1 justify-start rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-normal px-4 py-2.5' variant="secondary">
        {userData?.name ? `What is on your mind, ${userData.name.split(' ')[0]}?` : 'What is on your mind?'}
      </Button>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="rounded-2xl">
            <Modal.CloseTrigger />
            <Modal.Header className="border-b border-gray-100">
              <Modal.Heading className="text-lg font-bold text-gray-900">Create Post</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="py-4">
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  <Avatar.Image alt={userData?.name || "John Doe"} src={userData?.photo} />
                </Avatar>
                <p className="font-semibold text-gray-900">{userData?.name}</p>
              </div>

              <div className='flex gap-3 items-end'>
                    <TextArea
                    ref={body}
      aria-label="Quick project update"
      className="h-32 w-full"
      placeholder="What is on your mind ....?"
    />

    <label htmlFor='img' className="cursor-pointer text-gray-400 hover:text-[#002984] transition-colors shrink-0">

    <Input ref={image} onChange={hanleImagePreview} type="file" id='img' hidden  />

<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
</svg>

    </label>



              </div>
 {uploadedImg && <div className='relative mt-3 rounded-xl overflow-hidden border border-gray-200'>
             <img src={uploadedImg} alt="" className="w-full max-h-72 object-cover" />
             <button type="button" onClick={handleCloseImg} className='absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-sm transition-colors'>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>
             </button>


              </div>}
            </Modal.Body>
            <Modal.Footer>
              <Button isDisabled={isPending} onClick={mutate} className="w-full bg-[#002984] text-white font-semibold py-3 rounded-xl hover:bg-blue-900 transition-all" slot="close">
               
{isPending?                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mx-auto animate-spin">
  <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 6-6m0 0 6 6m-6-6v12a6 6 0 0 1-12 0v-3" />
</svg>:'Create Post'}

              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
      
      </div>



    </div>
  )
}
