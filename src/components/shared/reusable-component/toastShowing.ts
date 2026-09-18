import { toast, ToastPosition  } from "react-toastify";

export const toastShowing = (content: string, toastPosition: ToastPosition, time: number, background: string, tColor: string) => {
    toast.success(content, {
        position: toastPosition,
        autoClose: time,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        theme: 'colored',
        style: { 
          backgroundColor: background,
          color: tColor,
        },
      });      
}


// Sample of calling this function to show toast. 

// toastShowing('User information updated successfully', 'bottom-right', 2500, '#000', 'white')