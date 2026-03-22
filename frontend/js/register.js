function checkPassword(){
    const pass=document.getElementById("password").value;
    const confirmpass=document.getElementById("confirmPassword").value;
    const mess=document.getElementById("mess");
    if(confirmpass.length==0){
        mess.innerHTML="";
    }
    if(pass===confirmpass){
        mess.innerHTML="";
    }
    else{
        mess.innerHTML="Password does not match";
        mess.style.color="red";
    }
}